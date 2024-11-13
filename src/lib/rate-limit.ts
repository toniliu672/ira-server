// src/lib/rate-limit.ts

interface RateLimitConfig {
    interval: number; // dalam milidetik
    uniqueTokenPerInterval: number;
  }
  
  interface RateLimitInfo {
    remaining: number;
    reset: Date;
  }
  
  export class RateLimit {
    private requests: Map<string, number[]>;
    private interval: number;
    private maxRequests: number;
  
    constructor({ interval, uniqueTokenPerInterval }: RateLimitConfig) {
      this.requests = new Map();
      this.interval = interval;
      this.maxRequests = uniqueTokenPerInterval;
    }
  
    private getKey(req: Request): string {
      // Gunakan IP address sebagai key
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";
      return `${ip}`;
    }
  
    private cleanup(key: string): void {
      const now = Date.now();
      const requests = this.requests.get(key) || [];
      const validRequests = requests.filter(
        timestamp => now - timestamp < this.interval
      );
      this.requests.set(key, validRequests);
    }
  
    async check(req: Request, limit?: number): Promise<RateLimitInfo> {
      const key = this.getKey(req);
      const now = Date.now();
      const maxRequests = limit || this.maxRequests;
  
      // Cleanup expired requests
      this.cleanup(key);
  
      const requests = this.requests.get(key) || [];
      const count = requests.length;
  
      if (count >= maxRequests) {
        const oldestRequest = Math.min(...requests);
        const reset = new Date(oldestRequest + this.interval);
        
        throw new Error(`Rate limit exceeded. Try again after ${reset.toISOString()}`);
      }
  
      // Add new request
      requests.push(now);
      this.requests.set(key, requests);
  
      return {
        remaining: maxRequests - requests.length,
        reset: new Date(now + this.interval)
      };
    }
  }
  
  // Factory function untuk membuat rate limiter
  export function rateLimit(config: RateLimitConfig): RateLimit {
    return new RateLimit(config);
  }