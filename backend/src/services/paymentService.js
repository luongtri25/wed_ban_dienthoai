const crypto = require("crypto");
const orderService = require("./orderService");

const getConfig = () => {
  const config = {
    endpoint: process.env.MOMO_ENDPOINT,
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    redirectUrl: process.env.MOMO_REDIRECT_URL,
    ipnUrl: process.env.MOMO_IPN_URL,
    partnerName: process.env.MOMO_PARTNER_NAME || "Phone Store",
    storeId: process.env.MOMO_STORE_ID || "PhoneStore",
  };

  const missing = Object.entries({
    MOMO_ENDPOINT: config.endpoint,
    MOMO_PARTNER_CODE: config.partnerCode,
    MOMO_ACCESS_KEY: config.accessKey,
    MOMO_SECRET_KEY: config.secretKey,
    MOMO_REDIRECT_URL: config.redirectUrl,
    MOMO_IPN_URL: config.ipnUrl,
  }).filter(([, value]) => {
    if (!value || !String(value).trim()) return true;
    const normalized = String(value).trim();
    return normalized === "..." || normalized.includes("<") || normalized.includes(">");
  });

  if (missing.length) {
    const message = `Missing/invalid MoMo env: ${missing.map(([key]) => key).join(", ")}`;
    throw Object.assign(new Error(message), { status: 500 });
  }

  return config;
};

const sign = (raw, secretKey) =>
  crypto.createHmac("sha256", secretKey).update(raw).digest("hex");

const toSignatureValue = (value) => (value == null ? "" : String(value));

exports.createMomoPayment = async ({ userId, items, shippingAddress }) => {
  const config = getConfig();

  const order = await orderService.createSafe({
    userId,
    items,
    shippingAddress,
    paymentMethod: "momo",
  });

  const orderId = String(order._id);
  const requestId = `${orderId}-${Date.now()}`;
  const amount = String(Math.round(order.totalPrice || 0));
  const orderInfo = `Thanh toan don hang ${orderId}`;
  const requestType = "payWithMethod";
  const extraData = "";
  const orderGroupId = "";

  const rawSignature =
    `accessKey=${config.accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${config.ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${config.partnerCode}` +
    `&redirectUrl=${config.redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  const payload = {
    partnerCode: config.partnerCode,
    partnerName: config.partnerName,
    storeId: config.storeId,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: config.redirectUrl,
    ipnUrl: config.ipnUrl,
    requestType,
    extraData,
    orderGroupId,
    lang: "vi",
    autoCapture: true,
    signature: sign(rawSignature, config.secretKey),
  };

  try {
    const res = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!res.ok || Number(data.resultCode) !== 0 || !data.payUrl) {
      await orderService.markMomoFailedAndReleaseStock(
        orderId,
        data?.message || "Cannot create MoMo payment link"
      );
      const msg = data?.message || "MoMo create payment failed";
      throw Object.assign(new Error(msg), { status: 400, rolledBack: true });
    }

    return { orderId, payUrl: data.payUrl };
  } catch (error) {
    if (!error?.rolledBack) {
      await orderService.markMomoFailedAndReleaseStock(
        orderId,
        error?.message || "MoMo network error"
      );
    }
    throw Object.assign(new Error(error?.message || "MoMo request failed"), {
      status: error?.status || 500,
    });
  }
};

exports.handleMomoIpn = async (body) => {
  const config = getConfig();

  const rawSignature =
    `accessKey=${config.accessKey}` +
    `&amount=${toSignatureValue(body.amount)}` +
    `&extraData=${toSignatureValue(body.extraData)}` +
    `&message=${toSignatureValue(body.message)}` +
    `&orderId=${toSignatureValue(body.orderId)}` +
    `&orderInfo=${toSignatureValue(body.orderInfo)}` +
    `&orderType=${toSignatureValue(body.orderType)}` +
    `&partnerCode=${toSignatureValue(body.partnerCode)}` +
    `&payType=${toSignatureValue(body.payType)}` +
    `&requestId=${toSignatureValue(body.requestId)}` +
    `&responseTime=${toSignatureValue(body.responseTime)}` +
    `&resultCode=${toSignatureValue(body.resultCode)}` +
    `&transId=${toSignatureValue(body.transId)}`;

  const expected = sign(rawSignature, config.secretKey);
  if (expected !== body.signature) {
    throw Object.assign(new Error("Invalid MoMo signature"), { status: 400 });
  }

  if (Number(body.resultCode) === 0) {
    await orderService.markMomoPaid(body.orderId, body.transId);
    return;
  }

  await orderService.markMomoFailedAndReleaseStock(
    body.orderId,
    body.message || "MoMo payment failed"
  );
};
