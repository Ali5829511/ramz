// Shim لـ @supabase/node-fetch في بيئة المتصفح
// يستخدم fetch النافي للمتصفح بدلاً من node-fetch
export default window.fetch.bind(window);
export const Headers = window.Headers;
export const Request = window.Request;
export const Response = window.Response;
