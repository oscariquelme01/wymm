import { createPrivateKey, KeyObject } from "crypto";
import { IBankingProvider } from "../domain/IBanking-provider.interface";
import { SignJWT } from "jose";
import { env } from "src/config/env";
import { Injectable } from "@nestjs/common";

const MAX_TTL_SECONDS = 60 * 60 * 24;

let cachedKey: KeyObject | null = null;

function getPrivateKey(): KeyObject {
  if (!cachedKey) {
    cachedKey = createPrivateKey(env.enableBanking.privateKeyPem);
  }
  return cachedKey;
}

export const enableBankingConfig = {
  baseUrl: env.enableBanking.baseUrl
};

@Injectable()
export class EnableBankingBankingProviderAdapter implements IBankingProvider {
	async makeRequest<T>(
		path: string,
		method: string,
		body: Object = {}
	): Promise<T> {
		const token = await this.generateEnableBankingJwt();
		const url = `${enableBankingConfig.baseUrl}${path}`;

		const response = await fetch(url, {
			method: method ?? "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${token}`,
				...(body ? { "Content-Type": "application/json" } : {})
			},
			body: body ? JSON.stringify(body) : undefined
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(
				`Enable Banking request failed: ${response.status} ${response.statusText} - ${text}`
			);
		}

		return (await response.json()) as T;
	}

	private async generateEnableBankingJwt(
		ttlSeconds = 300
	): Promise<string> {
		if (ttlSeconds <= 0 || ttlSeconds > MAX_TTL_SECONDS) {
			throw new Error(`ttl Seconds must be between 1 and ${MAX_TTL_SECONDS}`);
		}

		const now = Math.floor(Date.now() / 1000);
		const key = getPrivateKey();

		return new SignJWT({})
			.setProtectedHeader({
				typ: "JWT",
				alg: "RS256",
				kid: env.enableBanking.appId
			})
			.setIssuer("enablebanking.com")
			.setAudience(env.enableBanking.audience)
			.setIssuedAt(now)
			.setExpirationTime(now + ttlSeconds)
			.sign(key);
	}
} 
