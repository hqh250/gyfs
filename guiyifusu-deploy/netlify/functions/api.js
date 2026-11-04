/* Netlify Function：/api/* → 共享数据（Netlify Blobs） */
const { getStore } = require("@netlify/blobs");
const { handle } = require("./_api");

exports.handler = async function (event) {
  const store = getStore({ name: "gyfs", consistency: "strong" });
  try {
    const res = await handle(event, store);
    return {
      statusCode: res.status,
      headers: res.headers,
      body: JSON.stringify(res.json),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, msg: "server error", detail: String(e && e.message) }),
    };
  }
};
