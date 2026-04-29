// استفاده از Edge Runtime برای حذف تاخیر Cold Start و کاهش پینگ
export const config = {
  runtime: "edge",
};

const DEST = (process.env.TARGET_DOMAIN || "").replace(/\/$/, "");

export default async function (req) {
  if (!DEST) return new Response("Destination Not Set", { status: 500 });

  const url = new URL(req.url);
  const target = DEST + url.pathname + url.search;

  // بهینه‌سازی هدرها برای عبور سریع‌تر
  const newHeaders = new Headers(req.headers);
  newHeaders.delete("host");
  newHeaders.delete("connection");

  try {
    // استفاده از fetch مستقیم بدون پردازش اضافه برای کاهش Latency
    const response = await fetch(target, {
      method: req.method,
      headers: newHeaders,
      body: req.body,
      redirect: "manual",
      // بهینه‌سازی برای ارسال سریع داده‌های باینری
      duplex: "half", 
    });

    return response;
  } catch (e) {
    return new Response("Bridge Error", { status: 502 });
  }
}
