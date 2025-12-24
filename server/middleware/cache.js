import apicache from "apicache";

const cache = apicache.options({
  respectCacheControl: true,
}).middleware;

export default cache;