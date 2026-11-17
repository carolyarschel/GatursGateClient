"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/express/index.ts
var express_exports = {};
__export(express_exports, {
  CAMINHOS: () => CAMINHOS,
  RETORNO: () => RETORNO,
  armazenamentoEmMemoriaSoParaTestes: () => armazenamentoEmMemoriaSoParaTestes,
  criarPortao: () => criarPortao,
  ehPapel: () => ehPapel,
  exigirPapel: () => exigirPapel
});
module.exports = __toCommonJS(express_exports);

// src/express/portao.ts
var import_node_crypto2 = require("crypto");
var import_express = require("express");

// node_modules/oauth4webapi/build/index.js
var USER_AGENT;
if (typeof navigator === "undefined" || !navigator.userAgent?.startsWith?.("Mozilla/5.0 ")) {
  const NAME = "oauth4webapi";
  const VERSION = "v3.8.8";
  USER_AGENT = `${NAME}/${VERSION}`;
}
function looseInstanceOf(input, expected) {
  if (input == null) {
    return false;
  }
  try {
    return input instanceof expected || Object.getPrototypeOf(input)[Symbol.toStringTag] === expected.prototype[Symbol.toStringTag];
  } catch {
    return false;
  }
}
var ERR_INVALID_ARG_VALUE = "ERR_INVALID_ARG_VALUE";
var ERR_INVALID_ARG_TYPE = "ERR_INVALID_ARG_TYPE";
function CodedTypeError(message2, code, cause) {
  const err = new TypeError(message2, { cause });
  Object.assign(err, { code });
  return err;
}
var allowInsecureRequests = /* @__PURE__ */ Symbol();
var clockSkew = /* @__PURE__ */ Symbol();
var clockTolerance = /* @__PURE__ */ Symbol();
var customFetch = /* @__PURE__ */ Symbol();
var jweDecrypt = /* @__PURE__ */ Symbol();
var encoder = new TextEncoder();
var decoder = new TextDecoder();
function buf(input) {
  if (typeof input === "string") {
    return encoder.encode(input);
  }
  return decoder.decode(input);
}
var encodeBase64Url;
if (Uint8Array.prototype.toBase64) {
  encodeBase64Url = (input) => {
    if (input instanceof ArrayBuffer) {
      input = new Uint8Array(input);
    }
    return input.toBase64({ alphabet: "base64url", omitPadding: true });
  };
} else {
  const CHUNK_SIZE = 32768;
  encodeBase64Url = (input) => {
    if (input instanceof ArrayBuffer) {
      input = new Uint8Array(input);
    }
    const arr = [];
    for (let i = 0; i < input.byteLength; i += CHUNK_SIZE) {
      arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
    }
    return btoa(arr.join("")).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };
}
var decodeBase64Url;
if (Uint8Array.fromBase64) {
  decodeBase64Url = (input) => {
    try {
      return Uint8Array.fromBase64(input, { alphabet: "base64url" });
    } catch (cause) {
      throw CodedTypeError("The input to be decoded is not correctly encoded.", ERR_INVALID_ARG_VALUE, cause);
    }
  };
} else {
  decodeBase64Url = (input) => {
    try {
      const binary = atob(input.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, ""));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch (cause) {
      throw CodedTypeError("The input to be decoded is not correctly encoded.", ERR_INVALID_ARG_VALUE, cause);
    }
  };
}
function b64u(input) {
  if (typeof input === "string") {
    return decodeBase64Url(input);
  }
  return encodeBase64Url(input);
}
var UnsupportedOperationError = class extends Error {
  code;
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    this.code = UNSUPPORTED_OPERATION;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var OperationProcessingError = class extends Error {
  code;
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    if (options?.code) {
      this.code = options?.code;
    }
    Error.captureStackTrace?.(this, this.constructor);
  }
};
function OPE(message2, code, cause) {
  return new OperationProcessingError(message2, { code, cause });
}
function isJsonObject(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return false;
  }
  return true;
}
function prepareHeaders(input) {
  if (looseInstanceOf(input, Headers)) {
    input = Object.fromEntries(input.entries());
  }
  const headers2 = new Headers(input ?? {});
  if (USER_AGENT && !headers2.has("user-agent")) {
    headers2.set("user-agent", USER_AGENT);
  }
  if (headers2.has("authorization")) {
    throw CodedTypeError('"options.headers" must not include the "authorization" header name', ERR_INVALID_ARG_VALUE);
  }
  return headers2;
}
function signal(url, value) {
  if (value !== void 0) {
    if (typeof value === "function") {
      value = value(url.href);
    }
    if (!(value instanceof AbortSignal)) {
      throw CodedTypeError('"options.signal" must return or be an instance of AbortSignal', ERR_INVALID_ARG_TYPE);
    }
    return value;
  }
  return void 0;
}
function replaceDoubleSlash(pathname) {
  if (pathname.includes("//")) {
    return pathname.replace("//", "/");
  }
  return pathname;
}
function prependWellKnown(url, wellKnown, allowTerminatingSlash = false) {
  if (url.pathname === "/") {
    url.pathname = wellKnown;
  } else {
    url.pathname = replaceDoubleSlash(`${wellKnown}/${allowTerminatingSlash ? url.pathname : url.pathname.replace(/(\/)$/, "")}`);
  }
  return url;
}
function appendWellKnown(url, wellKnown) {
  url.pathname = replaceDoubleSlash(`${url.pathname}/${wellKnown}`);
  return url;
}
async function performDiscovery(input, urlName, transform2, options) {
  if (!(input instanceof URL)) {
    throw CodedTypeError(`"${urlName}" must be an instance of URL`, ERR_INVALID_ARG_TYPE);
  }
  checkProtocol(input, options?.[allowInsecureRequests] !== true);
  const url = transform2(new URL(input.href));
  const headers2 = prepareHeaders(options?.headers);
  headers2.set("accept", "application/json");
  return (options?.[customFetch] || fetch)(url.href, {
    body: void 0,
    headers: Object.fromEntries(headers2.entries()),
    method: "GET",
    redirect: "manual",
    signal: signal(url, options?.signal)
  });
}
async function discoveryRequest(issuerIdentifier, options) {
  return performDiscovery(issuerIdentifier, "issuerIdentifier", (url) => {
    switch (options?.algorithm) {
      case void 0:
      case "oidc":
        appendWellKnown(url, ".well-known/openid-configuration");
        break;
      case "oauth2":
        prependWellKnown(url, ".well-known/oauth-authorization-server");
        break;
      default:
        throw CodedTypeError('"options.algorithm" must be "oidc" (default), or "oauth2"', ERR_INVALID_ARG_VALUE);
    }
    return url;
  }, options);
}
function assertNumber(input, allow0, it, code, cause) {
  try {
    if (typeof input !== "number" || !Number.isFinite(input)) {
      throw CodedTypeError(`${it} must be a number`, ERR_INVALID_ARG_TYPE, cause);
    }
    if (input > 0)
      return;
    if (allow0) {
      if (input !== 0) {
        throw CodedTypeError(`${it} must be a non-negative number`, ERR_INVALID_ARG_VALUE, cause);
      }
      return;
    }
    throw CodedTypeError(`${it} must be a positive number`, ERR_INVALID_ARG_VALUE, cause);
  } catch (err) {
    if (code) {
      throw OPE(err.message, code, cause);
    }
    throw err;
  }
}
function assertString(input, it, code, cause) {
  try {
    if (typeof input !== "string") {
      throw CodedTypeError(`${it} must be a string`, ERR_INVALID_ARG_TYPE, cause);
    }
    if (input.length === 0) {
      throw CodedTypeError(`${it} must not be empty`, ERR_INVALID_ARG_VALUE, cause);
    }
  } catch (err) {
    if (code) {
      throw OPE(err.message, code, cause);
    }
    throw err;
  }
}
async function processDiscoveryResponse(expectedIssuerIdentifier, response) {
  const expected = expectedIssuerIdentifier;
  if (!(expected instanceof URL) && expected !== _nodiscoverycheck) {
    throw CodedTypeError('"expectedIssuerIdentifier" must be an instance of URL', ERR_INVALID_ARG_TYPE);
  }
  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE);
  }
  if (response.status !== 200) {
    throw OPE('"response" is not a conform Authorization Server Metadata response (unexpected HTTP status code)', RESPONSE_IS_NOT_CONFORM, response);
  }
  assertReadableResponse(response);
  const json = await getResponseJsonBody(response);
  assertString(json.issuer, '"response" body "issuer" property', INVALID_RESPONSE, { body: json });
  if (expected !== _nodiscoverycheck && new URL(json.issuer).href !== expected.href) {
    throw OPE('"response" body "issuer" property does not match the expected value', JSON_ATTRIBUTE_COMPARISON, { expected: expected.href, body: json, attribute: "issuer" });
  }
  return json;
}
function assertApplicationJson(response) {
  assertContentType(response, "application/json");
}
function notJson(response, ...types) {
  let msg = '"response" content-type must be ';
  if (types.length > 2) {
    const last = types.pop();
    msg += `${types.join(", ")}, or ${last}`;
  } else if (types.length === 2) {
    msg += `${types[0]} or ${types[1]}`;
  } else {
    msg += types[0];
  }
  return OPE(msg, RESPONSE_IS_NOT_JSON, response);
}
function assertContentType(response, contentType) {
  if (getContentType(response) !== contentType) {
    throw notJson(response, contentType);
  }
}
function randomBytes() {
  return b64u(crypto.getRandomValues(new Uint8Array(32)));
}
function generateRandomCodeVerifier() {
  return randomBytes();
}
function generateRandomState() {
  return randomBytes();
}
function generateRandomNonce() {
  return randomBytes();
}
async function calculatePKCECodeChallenge(codeVerifier) {
  assertString(codeVerifier, "codeVerifier");
  return b64u(await crypto.subtle.digest("SHA-256", buf(codeVerifier)));
}
function getClockSkew(client) {
  const skew = client?.[clockSkew];
  return typeof skew === "number" && Number.isFinite(skew) ? skew : 0;
}
function getClockTolerance(client) {
  const tolerance = client?.[clockTolerance];
  return typeof tolerance === "number" && Number.isFinite(tolerance) && Math.sign(tolerance) !== -1 ? tolerance : 30;
}
function epochTime() {
  return Math.floor(Date.now() / 1e3);
}
function assertAs(as) {
  if (typeof as !== "object" || as === null) {
    throw CodedTypeError('"as" must be an object', ERR_INVALID_ARG_TYPE);
  }
  assertString(as.issuer, '"as.issuer"');
}
function assertClient(client) {
  if (typeof client !== "object" || client === null) {
    throw CodedTypeError('"client" must be an object', ERR_INVALID_ARG_TYPE);
  }
  assertString(client.client_id, '"client.client_id"');
}
function formUrlEncode(token) {
  return encodeURIComponent(token).replace(/(?:[-_.!~*'()]|%20)/g, (substring) => {
    switch (substring) {
      case "-":
      case "_":
      case ".":
      case "!":
      case "~":
      case "*":
      case "'":
      case "(":
      case ")":
        return `%${substring.charCodeAt(0).toString(16).toUpperCase()}`;
      case "%20":
        return "+";
      default:
        throw new Error();
    }
  });
}
function ClientSecretPost(clientSecret) {
  assertString(clientSecret, '"clientSecret"');
  return (_as, client, body, _headers) => {
    body.set("client_id", client.client_id);
    body.set("client_secret", clientSecret);
  };
}
function ClientSecretBasic(clientSecret) {
  assertString(clientSecret, '"clientSecret"');
  return (_as, client, _body, headers2) => {
    const username = formUrlEncode(client.client_id);
    const password = formUrlEncode(clientSecret);
    const credentials = btoa(`${username}:${password}`);
    headers2.set("authorization", `Basic ${credentials}`);
  };
}
function None() {
  return (_as, client, body, _headers) => {
    body.set("client_id", client.client_id);
  };
}
var URLParse = URL.parse ? (url, base) => URL.parse(url, base) : (url, base) => {
  try {
    return new URL(url, base);
  } catch {
    return null;
  }
};
function checkProtocol(url, enforceHttps) {
  if (enforceHttps && url.protocol !== "https:") {
    throw OPE("only requests to HTTPS are allowed", HTTP_REQUEST_FORBIDDEN, url);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw OPE("only HTTP and HTTPS requests are allowed", REQUEST_PROTOCOL_FORBIDDEN, url);
  }
}
function validateEndpoint(value, endpoint, useMtlsAlias, enforceHttps) {
  let url;
  if (typeof value !== "string" || !(url = URLParse(value))) {
    throw OPE(`authorization server metadata does not contain a valid ${useMtlsAlias ? `"as.mtls_endpoint_aliases.${endpoint}"` : `"as.${endpoint}"`}`, value === void 0 ? MISSING_SERVER_METADATA : INVALID_SERVER_METADATA, { attribute: useMtlsAlias ? `mtls_endpoint_aliases.${endpoint}` : endpoint });
  }
  checkProtocol(url, enforceHttps);
  return url;
}
function resolveEndpoint(as, endpoint, useMtlsAlias, enforceHttps) {
  if (useMtlsAlias && as.mtls_endpoint_aliases && endpoint in as.mtls_endpoint_aliases) {
    return validateEndpoint(as.mtls_endpoint_aliases[endpoint], endpoint, useMtlsAlias, enforceHttps);
  }
  return validateEndpoint(as[endpoint], endpoint, useMtlsAlias, enforceHttps);
}
function isDPoPNonceError(err) {
  if (err instanceof WWWAuthenticateChallengeError) {
    return err.cause.some((challenge) => challenge.scheme === "dpop" && challenge.parameters.error === "use_dpop_nonce");
  }
  if (err instanceof ResponseBodyError) {
    return err.error === "use_dpop_nonce";
  }
  return false;
}
var ResponseBodyError = class extends Error {
  cause;
  code;
  error;
  status;
  error_description;
  response;
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    this.code = RESPONSE_BODY_ERROR;
    this.cause = options.cause;
    this.error = options.cause.error;
    this.status = options.response.status;
    this.error_description = options.cause.error_description;
    Object.defineProperty(this, "response", { enumerable: false, value: options.response });
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var AuthorizationResponseError = class extends Error {
  cause;
  code;
  error;
  error_description;
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    this.code = AUTHORIZATION_RESPONSE_ERROR;
    this.cause = options.cause;
    this.error = options.cause.get("error");
    this.error_description = options.cause.get("error_description") ?? void 0;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var WWWAuthenticateChallengeError = class extends Error {
  cause;
  code;
  response;
  status;
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    this.code = WWW_AUTHENTICATE_CHALLENGE;
    this.cause = options.cause;
    this.status = options.response.status;
    this.response = options.response;
    Object.defineProperty(this, "response", { enumerable: false });
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var tokenMatch = "[a-zA-Z0-9!#$%&\\'\\*\\+\\-\\.\\^_`\\|~]+";
var token68Match = "[a-zA-Z0-9\\-\\._\\~\\+\\/]+={0,2}";
var quotedMatch = '"((?:[^"\\\\]|\\\\[\\s\\S])*)"';
var quotedParamMatcher = "(" + tokenMatch + ")\\s*=\\s*" + quotedMatch;
var paramMatcher = "(" + tokenMatch + ")\\s*=\\s*(" + tokenMatch + ")";
var schemeRE = new RegExp("^[,\\s]*(" + tokenMatch + ")");
var quotedParamRE = new RegExp("^[,\\s]*" + quotedParamMatcher + "[,\\s]*(.*)");
var unquotedParamRE = new RegExp("^[,\\s]*" + paramMatcher + "[,\\s]*(.*)");
var token68ParamRE = new RegExp("^(" + token68Match + ")(?:$|[,\\s])(.*)");
function parseWwwAuthenticateChallenges(response) {
  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE);
  }
  const header = response.headers.get("www-authenticate");
  if (header === null) {
    return void 0;
  }
  const challenges = [];
  let rest = header;
  while (rest) {
    let match = rest.match(schemeRE);
    const scheme = match?.["1"].toLowerCase();
    if (!scheme) {
      return void 0;
    }
    const afterScheme = rest.substring(match[0].length);
    if (afterScheme && !afterScheme.match(/^[\s,]/)) {
      return void 0;
    }
    const spaceMatch = afterScheme.match(/^\s+(.*)$/);
    const hasParameters = !!spaceMatch;
    rest = spaceMatch ? spaceMatch[1] : void 0;
    const parameters = {};
    let token68;
    if (hasParameters) {
      while (rest) {
        let key;
        let value;
        if (match = rest.match(quotedParamRE)) {
          ;
          [, key, value, rest] = match;
          if (value.includes("\\")) {
            value = value.replace(/\\([\s\S])/g, "$1");
          }
          parameters[key.toLowerCase()] = value;
          continue;
        }
        if (match = rest.match(unquotedParamRE)) {
          ;
          [, key, value, rest] = match;
          parameters[key.toLowerCase()] = value;
          continue;
        }
        if (match = rest.match(token68ParamRE)) {
          if (Object.keys(parameters).length) {
            break;
          }
          ;
          [, token68, rest] = match;
          break;
        }
        return void 0;
      }
    } else {
      rest = afterScheme || void 0;
    }
    const challenge = { scheme, parameters };
    if (token68) {
      challenge.token68 = token68;
    }
    challenges.push(challenge);
  }
  if (!challenges.length) {
    return void 0;
  }
  return challenges;
}
async function parseOAuthResponseErrorBody(response) {
  if (response.status > 399 && response.status < 500) {
    assertReadableResponse(response);
    assertApplicationJson(response);
    try {
      const json = await response.clone().json();
      if (isJsonObject(json) && typeof json.error === "string" && json.error.length) {
        return json;
      }
    } catch {
    }
  }
  return void 0;
}
async function checkOAuthBodyError(response, expected, label) {
  if (response.status !== expected) {
    checkAuthenticationChallenges(response);
    let err;
    if (err = await parseOAuthResponseErrorBody(response)) {
      await response.body?.cancel();
      throw new ResponseBodyError("server responded with an error in the response body", {
        cause: err,
        response
      });
    }
    throw OPE(`"response" is not a conform ${label} response (unexpected HTTP status code)`, RESPONSE_IS_NOT_CONFORM, response);
  }
}
function assertDPoP(option) {
  if (!branded.has(option)) {
    throw CodedTypeError('"options.DPoP" is not a valid DPoPHandle', ERR_INVALID_ARG_VALUE);
  }
}
function getContentType(input) {
  return input.headers.get("content-type")?.split(";")[0];
}
async function authenticatedRequest(as, client, clientAuthentication, url, body, headers2, options) {
  await clientAuthentication(as, client, body, headers2);
  headers2.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
  return (options?.[customFetch] || fetch)(url.href, {
    body,
    headers: Object.fromEntries(headers2.entries()),
    method: "POST",
    redirect: "manual",
    signal: signal(url, options?.signal)
  });
}
async function tokenEndpointRequest(as, client, clientAuthentication, grantType, parameters, options) {
  const url = resolveEndpoint(as, "token_endpoint", client.use_mtls_endpoint_aliases, options?.[allowInsecureRequests] !== true);
  parameters.set("grant_type", grantType);
  const headers2 = prepareHeaders(options?.headers);
  headers2.set("accept", "application/json");
  if (options?.DPoP !== void 0) {
    assertDPoP(options.DPoP);
    await options.DPoP.addProof(url, headers2, "POST");
  }
  const response = await authenticatedRequest(as, client, clientAuthentication, url, parameters, headers2, options);
  options?.DPoP?.cacheNonce(response, url);
  return response;
}
var idTokenClaims = /* @__PURE__ */ new WeakMap();
var jwtRefs = /* @__PURE__ */ new WeakMap();
function getValidatedIdTokenClaims(ref) {
  if (!ref.id_token) {
    return void 0;
  }
  const claims = idTokenClaims.get(ref);
  if (!claims) {
    throw CodedTypeError('"ref" was already garbage collected or did not resolve from the proper sources', ERR_INVALID_ARG_VALUE);
  }
  return claims;
}
async function processGenericAccessTokenResponse(as, client, response, additionalRequiredIdTokenClaims, decryptFn, recognizedTokenTypes) {
  assertAs(as);
  assertClient(client);
  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE);
  }
  await checkOAuthBodyError(response, 200, "Token Endpoint");
  assertReadableResponse(response);
  const json = await getResponseJsonBody(response);
  assertString(json.access_token, '"response" body "access_token" property', INVALID_RESPONSE, {
    body: json
  });
  assertString(json.token_type, '"response" body "token_type" property', INVALID_RESPONSE, {
    body: json
  });
  json.token_type = json.token_type.toLowerCase();
  if (json.expires_in !== void 0) {
    let expiresIn = typeof json.expires_in !== "number" ? parseFloat(json.expires_in) : json.expires_in;
    assertNumber(expiresIn, true, '"response" body "expires_in" property', INVALID_RESPONSE, {
      body: json
    });
    json.expires_in = expiresIn;
  }
  if (json.refresh_token !== void 0) {
    assertString(json.refresh_token, '"response" body "refresh_token" property', INVALID_RESPONSE, {
      body: json
    });
  }
  if (json.scope !== void 0 && typeof json.scope !== "string") {
    throw OPE('"response" body "scope" property must be a string', INVALID_RESPONSE, { body: json });
  }
  if (json.id_token !== void 0) {
    assertString(json.id_token, '"response" body "id_token" property', INVALID_RESPONSE, {
      body: json
    });
    const requiredClaims = [];
    if (client.require_auth_time === true) {
      requiredClaims.push("auth_time");
    }
    if (client.default_max_age !== void 0) {
      assertNumber(client.default_max_age, true, '"client.default_max_age"');
      requiredClaims.push("auth_time");
    }
    if (additionalRequiredIdTokenClaims?.length) {
      requiredClaims.push(...additionalRequiredIdTokenClaims);
    }
    const { claims, jwt } = await validateIdTokenClaims(as, client, json.id_token, requiredClaims, decryptFn);
    validateIdTokenAuthorizedParty(client, claims);
    validateIdTokenAuthTimeClaim(claims);
    jwtRefs.set(response, jwt);
    idTokenClaims.set(json, claims);
  }
  if (recognizedTokenTypes?.[json.token_type] !== void 0) {
    recognizedTokenTypes[json.token_type](response, json);
  } else if (json.token_type !== "dpop" && json.token_type !== "bearer") {
    throw new UnsupportedOperationError("unsupported `token_type` value", { cause: { body: json } });
  }
  return json;
}
function checkAuthenticationChallenges(response) {
  let challenges;
  if (challenges = parseWwwAuthenticateChallenges(response)) {
    throw new WWWAuthenticateChallengeError("server responded with a challenge in the WWW-Authenticate HTTP Header", { cause: challenges, response });
  }
}
function validateAudience(expected, result) {
  if (Array.isArray(result.claims.aud)) {
    if (!result.claims.aud.includes(expected)) {
      throw OPE('unexpected JWT "aud" (audience) claim value', JWT_CLAIM_COMPARISON, {
        expected,
        claims: result.claims,
        claim: "aud"
      });
    }
  } else if (result.claims.aud !== expected) {
    throw OPE('unexpected JWT "aud" (audience) claim value', JWT_CLAIM_COMPARISON, {
      expected,
      claims: result.claims,
      claim: "aud"
    });
  }
  return result;
}
function validateIssuer(as, result) {
  const expected = as[_expectedIssuer]?.(result) ?? as.issuer;
  if (result.claims.iss !== expected) {
    throw OPE('unexpected JWT "iss" (issuer) claim value', JWT_CLAIM_COMPARISON, {
      expected,
      claims: result.claims,
      claim: "iss"
    });
  }
  return result;
}
var branded = /* @__PURE__ */ new WeakSet();
function brand(searchParams) {
  branded.add(searchParams);
  return searchParams;
}
var nopkce = /* @__PURE__ */ Symbol();
async function authorizationCodeGrantRequest(as, client, clientAuthentication, callbackParameters, redirectUri, codeVerifier, options) {
  assertAs(as);
  assertClient(client);
  if (!branded.has(callbackParameters)) {
    throw CodedTypeError('"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()', ERR_INVALID_ARG_VALUE);
  }
  assertString(redirectUri, '"redirectUri"');
  const code = getURLSearchParameter(callbackParameters, "code");
  if (!code) {
    throw OPE('no authorization code in "callbackParameters"', INVALID_RESPONSE);
  }
  const parameters = new URLSearchParams(options?.additionalParameters);
  parameters.set("redirect_uri", redirectUri);
  parameters.set("code", code);
  if (codeVerifier !== nopkce) {
    assertString(codeVerifier, '"codeVerifier"');
    parameters.set("code_verifier", codeVerifier);
  }
  return tokenEndpointRequest(as, client, clientAuthentication, "authorization_code", parameters, options);
}
var jwtClaimNames = {
  aud: "audience",
  c_hash: "code hash",
  client_id: "client id",
  exp: "expiration time",
  iat: "issued at",
  iss: "issuer",
  jti: "jwt id",
  nonce: "nonce",
  s_hash: "state hash",
  sub: "subject",
  ath: "access token hash",
  htm: "http method",
  htu: "http uri",
  cnf: "confirmation",
  auth_time: "authentication time"
};
function validatePresence(required, result) {
  for (const claim of required) {
    if (result.claims[claim] === void 0) {
      throw OPE(`JWT "${claim}" (${jwtClaimNames[claim]}) claim missing`, INVALID_RESPONSE, {
        claims: result.claims
      });
    }
  }
  return result;
}
function validateStringClaim(claim, result) {
  if (typeof result.claims[claim] !== "string") {
    throw OPE(`unexpected JWT "${claim}" (${jwtClaimNames[claim]}) claim type`, INVALID_RESPONSE, {
      claims: result.claims
    });
  }
  return result;
}
function validateIdTokenClaims(as, client, idToken, requiredClaims, decryptFn) {
  return validateJwt(idToken, checkSigningAlgorithm.bind(void 0, client.id_token_signed_response_alg, as.id_token_signing_alg_values_supported, "RS256"), getClockSkew(client), getClockTolerance(client), decryptFn).then(validatePresence.bind(void 0, ["aud", "exp", "iat", "iss", "sub", ...requiredClaims])).then(validateIssuer.bind(void 0, as)).then(validateAudience.bind(void 0, client.client_id)).then(validateStringClaim.bind(void 0, "sub"));
}
function resolveIdTokenMaxAge(client, maxAge) {
  if (maxAge === skipAuthTimeCheck) {
    return maxAge;
  }
  const fromClient = maxAge === void 0;
  if (fromClient) {
    maxAge = client.default_max_age;
  }
  if (maxAge === void 0) {
    return skipAuthTimeCheck;
  }
  assertNumber(maxAge, true, fromClient ? '"client.default_max_age"' : '"maxAge" argument');
  return maxAge;
}
function validateIdTokenAuthTimeClaim(claims) {
  if (claims.auth_time !== void 0) {
    assertNumber(claims.auth_time, true, 'ID Token "auth_time" (authentication time)', INVALID_RESPONSE, { claims });
  }
}
function validateIdTokenAuthTime(client, claims, maxAge) {
  if (maxAge === skipAuthTimeCheck) {
    return;
  }
  const now = epochTime() + getClockSkew(client);
  const tolerance = getClockTolerance(client);
  if (claims.auth_time + maxAge < now - tolerance) {
    throw OPE("too much time has elapsed since the last End-User authentication", JWT_TIMESTAMP_CHECK, { claims, now, tolerance, claim: "auth_time" });
  }
}
function validateIdTokenNonce(claims, expectedNonce) {
  const expected = expectedNonce === expectNoNonce ? void 0 : expectedNonce;
  if (claims.nonce !== expected) {
    throw OPE('unexpected ID Token "nonce" claim value', JWT_CLAIM_COMPARISON, {
      expected,
      claims,
      claim: "nonce"
    });
  }
}
function validateIdTokenAuthorizedParty(client, claims) {
  if (Array.isArray(claims.aud) && claims.aud.length !== 1) {
    if (claims.azp === void 0) {
      throw OPE('ID Token "aud" (audience) claim includes additional untrusted audiences', JWT_CLAIM_COMPARISON, { claims, claim: "aud" });
    }
    if (claims.azp !== client.client_id) {
      throw OPE('unexpected ID Token "azp" (authorized party) claim value', JWT_CLAIM_COMPARISON, {
        expected: client.client_id,
        claims,
        claim: "azp"
      });
    }
  }
}
var expectNoNonce = /* @__PURE__ */ Symbol();
var skipAuthTimeCheck = /* @__PURE__ */ Symbol();
async function processAuthorizationCodeResponse(as, client, response, options) {
  if (typeof options?.expectedNonce === "string" || typeof options?.maxAge === "number" || options?.requireIdToken) {
    return processAuthorizationCodeOpenIDResponse(as, client, response, options.expectedNonce, options.maxAge, options[jweDecrypt], options.recognizedTokenTypes);
  }
  return processAuthorizationCodeOAuth2Response(as, client, response, options?.maxAge, options?.[jweDecrypt], options?.recognizedTokenTypes);
}
async function processAuthorizationCodeOpenIDResponse(as, client, response, expectedNonce, maxAge, decryptFn, recognizedTokenTypes) {
  const additionalRequiredClaims = [];
  switch (expectedNonce) {
    case void 0:
      expectedNonce = expectNoNonce;
      break;
    case expectNoNonce:
      break;
    default:
      assertString(expectedNonce, '"expectedNonce" argument');
      additionalRequiredClaims.push("nonce");
  }
  maxAge = resolveIdTokenMaxAge(client, maxAge);
  if (maxAge !== skipAuthTimeCheck) {
    additionalRequiredClaims.push("auth_time");
  }
  const result = await processGenericAccessTokenResponse(as, client, response, additionalRequiredClaims, decryptFn, recognizedTokenTypes);
  assertString(result.id_token, '"response" body "id_token" property', INVALID_RESPONSE, {
    body: result
  });
  const claims = getValidatedIdTokenClaims(result);
  validateIdTokenAuthTime(client, claims, maxAge);
  validateIdTokenNonce(claims, expectedNonce);
  return result;
}
async function processAuthorizationCodeOAuth2Response(as, client, response, maxAge, decryptFn, recognizedTokenTypes) {
  const result = await processGenericAccessTokenResponse(as, client, response, void 0, decryptFn, recognizedTokenTypes);
  const claims = getValidatedIdTokenClaims(result);
  if (claims) {
    validateIdTokenAuthTime(client, claims, resolveIdTokenMaxAge(client, maxAge));
    validateIdTokenNonce(claims, expectNoNonce);
  }
  return result;
}
var WWW_AUTHENTICATE_CHALLENGE = "OAUTH_WWW_AUTHENTICATE_CHALLENGE";
var RESPONSE_BODY_ERROR = "OAUTH_RESPONSE_BODY_ERROR";
var UNSUPPORTED_OPERATION = "OAUTH_UNSUPPORTED_OPERATION";
var AUTHORIZATION_RESPONSE_ERROR = "OAUTH_AUTHORIZATION_RESPONSE_ERROR";
var PARSE_ERROR = "OAUTH_PARSE_ERROR";
var INVALID_RESPONSE = "OAUTH_INVALID_RESPONSE";
var RESPONSE_IS_NOT_JSON = "OAUTH_RESPONSE_IS_NOT_JSON";
var RESPONSE_IS_NOT_CONFORM = "OAUTH_RESPONSE_IS_NOT_CONFORM";
var HTTP_REQUEST_FORBIDDEN = "OAUTH_HTTP_REQUEST_FORBIDDEN";
var REQUEST_PROTOCOL_FORBIDDEN = "OAUTH_REQUEST_PROTOCOL_FORBIDDEN";
var JWT_TIMESTAMP_CHECK = "OAUTH_JWT_TIMESTAMP_CHECK_FAILED";
var JWT_CLAIM_COMPARISON = "OAUTH_JWT_CLAIM_COMPARISON_FAILED";
var JSON_ATTRIBUTE_COMPARISON = "OAUTH_JSON_ATTRIBUTE_COMPARISON_FAILED";
var MISSING_SERVER_METADATA = "OAUTH_MISSING_SERVER_METADATA";
var INVALID_SERVER_METADATA = "OAUTH_INVALID_SERVER_METADATA";
function assertReadableResponse(response) {
  if (response.bodyUsed) {
    throw CodedTypeError('"response" body has been used already', ERR_INVALID_ARG_VALUE);
  }
}
async function validateJwt(jws, checkAlg, clockSkew2, clockTolerance2, decryptJwt) {
  let { 0: protectedHeader, 1: payload, length } = jws.split(".");
  if (length === 5) {
    if (decryptJwt !== void 0) {
      jws = await decryptJwt(jws);
      ({ 0: protectedHeader, 1: payload, length } = jws.split("."));
    } else {
      throw new UnsupportedOperationError("JWE decryption is not configured", { cause: jws });
    }
  }
  if (length !== 3) {
    throw OPE("Invalid JWT", INVALID_RESPONSE, jws);
  }
  let header;
  try {
    header = JSON.parse(buf(b64u(protectedHeader)));
  } catch (cause) {
    throw OPE("failed to parse JWT Header body as base64url encoded JSON", PARSE_ERROR, cause);
  }
  if (!isJsonObject(header)) {
    throw OPE("JWT Header must be a top level object", INVALID_RESPONSE, jws);
  }
  checkAlg(header);
  if (header.crit !== void 0) {
    throw new UnsupportedOperationError('no JWT "crit" header parameter extensions are supported', {
      cause: { header }
    });
  }
  let claims;
  try {
    claims = JSON.parse(buf(b64u(payload)));
  } catch (cause) {
    throw OPE("failed to parse JWT Payload body as base64url encoded JSON", PARSE_ERROR, cause);
  }
  if (!isJsonObject(claims)) {
    throw OPE("JWT Payload must be a top level object", INVALID_RESPONSE, jws);
  }
  const now = epochTime() + clockSkew2;
  if (claims.exp !== void 0) {
    if (typeof claims.exp !== "number") {
      throw OPE('unexpected JWT "exp" (expiration time) claim type', INVALID_RESPONSE, { claims });
    }
    if (claims.exp <= now - clockTolerance2) {
      throw OPE('unexpected JWT "exp" (expiration time) claim value, expiration is past current timestamp', JWT_TIMESTAMP_CHECK, { claims, now, tolerance: clockTolerance2, claim: "exp" });
    }
  }
  if (claims.iat !== void 0) {
    if (typeof claims.iat !== "number") {
      throw OPE('unexpected JWT "iat" (issued at) claim type', INVALID_RESPONSE, { claims });
    }
  }
  if (claims.iss !== void 0) {
    if (typeof claims.iss !== "string") {
      throw OPE('unexpected JWT "iss" (issuer) claim type', INVALID_RESPONSE, { claims });
    }
  }
  if (claims.nbf !== void 0) {
    if (typeof claims.nbf !== "number") {
      throw OPE('unexpected JWT "nbf" (not before) claim type', INVALID_RESPONSE, { claims });
    }
    if (claims.nbf > now + clockTolerance2) {
      throw OPE('unexpected JWT "nbf" (not before) claim value', JWT_TIMESTAMP_CHECK, {
        claims,
        now,
        tolerance: clockTolerance2,
        claim: "nbf"
      });
    }
  }
  if (claims.aud !== void 0) {
    if (typeof claims.aud !== "string" && !Array.isArray(claims.aud)) {
      throw OPE('unexpected JWT "aud" (audience) claim type', INVALID_RESPONSE, { claims });
    }
  }
  return { header, claims, jwt: jws };
}
async function consumeStream(request) {
  if (request.bodyUsed) {
    throw CodedTypeError("form_post Request instances must contain a readable body", ERR_INVALID_ARG_VALUE, { cause: request });
  }
  return request.text();
}
async function formPostResponse(request) {
  if (request.method !== "POST") {
    throw CodedTypeError("form_post responses are expected to use the POST method", ERR_INVALID_ARG_VALUE, { cause: request });
  }
  if (getContentType(request) !== "application/x-www-form-urlencoded") {
    throw CodedTypeError("form_post responses are expected to use the application/x-www-form-urlencoded content-type", ERR_INVALID_ARG_VALUE, { cause: request });
  }
  return consumeStream(request);
}
function checkSigningAlgorithm(client, issuer, fallback, header) {
  if (client !== void 0) {
    if (typeof client === "string" ? header.alg !== client : !client.includes(header.alg)) {
      throw OPE('unexpected JWT "alg" header parameter', INVALID_RESPONSE, {
        header,
        expected: client,
        reason: "client configuration"
      });
    }
    return;
  }
  if (Array.isArray(issuer)) {
    if (!issuer.includes(header.alg)) {
      throw OPE('unexpected JWT "alg" header parameter', INVALID_RESPONSE, {
        header,
        expected: issuer,
        reason: "authorization server metadata"
      });
    }
    return;
  }
  if (fallback !== void 0) {
    if (typeof fallback === "string" ? header.alg !== fallback : typeof fallback === "function" ? !fallback(header.alg) : !fallback.includes(header.alg)) {
      throw OPE('unexpected JWT "alg" header parameter', INVALID_RESPONSE, {
        header,
        expected: fallback,
        reason: "default value"
      });
    }
    return;
  }
  throw OPE('missing client or server configuration to verify used JWT "alg" header parameter', void 0, { client, issuer, fallback });
}
function getURLSearchParameter(parameters, name) {
  const { 0: value, length } = parameters.getAll(name);
  if (length > 1) {
    throw OPE(`"${name}" parameter must be provided only once`, INVALID_RESPONSE);
  }
  return value;
}
var skipStateCheck = /* @__PURE__ */ Symbol();
var expectNoState = /* @__PURE__ */ Symbol();
function validateAuthResponse(as, client, parameters, expectedState) {
  assertAs(as);
  assertClient(client);
  if (parameters instanceof URL) {
    parameters = parameters.searchParams;
  }
  if (!(parameters instanceof URLSearchParams)) {
    throw CodedTypeError('"parameters" must be an instance of URLSearchParams, or URL', ERR_INVALID_ARG_TYPE);
  }
  if (getURLSearchParameter(parameters, "response")) {
    throw OPE('"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()', INVALID_RESPONSE, { parameters });
  }
  const iss = getURLSearchParameter(parameters, "iss");
  const state = getURLSearchParameter(parameters, "state");
  if (!iss && as.authorization_response_iss_parameter_supported) {
    throw OPE('response parameter "iss" (issuer) missing', INVALID_RESPONSE, { parameters });
  }
  if (iss && iss !== as.issuer) {
    throw OPE('unexpected "iss" (issuer) response parameter value', INVALID_RESPONSE, {
      expected: as.issuer,
      parameters
    });
  }
  switch (expectedState) {
    case void 0:
    case expectNoState:
      if (state !== void 0) {
        throw OPE('unexpected "state" response parameter encountered', INVALID_RESPONSE, {
          expected: void 0,
          parameters
        });
      }
      break;
    case skipStateCheck:
      break;
    default:
      assertString(expectedState, '"expectedState" argument');
      if (state !== expectedState) {
        throw OPE(state === void 0 ? 'response parameter "state" missing' : 'unexpected "state" response parameter value', INVALID_RESPONSE, { expected: expectedState, parameters });
      }
  }
  const error = getURLSearchParameter(parameters, "error");
  if (error) {
    throw new AuthorizationResponseError("authorization response from the server is an error", {
      cause: parameters
    });
  }
  const id_token = getURLSearchParameter(parameters, "id_token");
  const token = getURLSearchParameter(parameters, "token");
  if (id_token !== void 0 || token !== void 0) {
    throw new UnsupportedOperationError("implicit and hybrid flows are not supported");
  }
  return brand(new URLSearchParams(parameters));
}
async function getResponseJsonBody(response, check = assertApplicationJson) {
  let json;
  try {
    json = await response.json();
  } catch (cause) {
    check(response);
    throw OPE('failed to parse "response" body as JSON', PARSE_ERROR, cause);
  }
  if (!isJsonObject(json)) {
    throw OPE('"response" body must be a top level object', INVALID_RESPONSE, { body: json });
  }
  return json;
}
var _nodiscoverycheck = /* @__PURE__ */ Symbol();
var _expectedIssuer = /* @__PURE__ */ Symbol();

// node_modules/jose/dist/webapi/lib/buffer_utils.js
var encoder2 = new TextEncoder();
var decoder2 = new TextDecoder();
var strictDecoder = new TextDecoder("utf-8", { fatal: true });
var UINT32_RANGE = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0), buf2 = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers)
    buf2.set(buffer, i), i += buffer.length;
  return buf2;
}
function writeUInt32BE(buf2, value, offset) {
  if (value < 0 || value >= UINT32_RANGE)
    throw new RangeError(`value must be >= 0 and <= ${UINT32_RANGE - 1}. Received ${value}`);
  buf2.set([value >>> 24, value >>> 16, value >>> 8, value & 255], offset);
}
function uint64be(value) {
  const high = Math.floor(value / UINT32_RANGE), low = value % UINT32_RANGE, buf2 = new Uint8Array(8);
  return writeUInt32BE(buf2, high, 0), writeUInt32BE(buf2, low, 4), buf2;
}
function uint32be(value) {
  const buf2 = new Uint8Array(4);
  return writeUInt32BE(buf2, value), buf2;
}
var NON_ASCII = /[^\x00-\x7f]/;
function encode(string) {
  if (typeof string == "string" && string.length >= 128) {
    if (NON_ASCII.test(string))
      throw new TypeError("non-ASCII string encountered in encode()");
    return encoder2.encode(string);
  }
  const bytes = new Uint8Array(string.length);
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    if (code > 127)
      throw new TypeError("non-ASCII string encountered in encode()");
    bytes[i] = code;
  }
  return bytes;
}
function encodeBase64(input, url = false) {
  if (Uint8Array.prototype.toBase64)
    return input.toBase64({ alphabet: url ? "base64url" : "base64", omitPadding: url });
  const CHUNK_SIZE = 32768, arr = [];
  for (let i = 0; i < input.length; i += CHUNK_SIZE)
    arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
  const encoded = btoa(arr.join(""));
  return url ? encoded.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_") : encoded;
}
function decodeBase64(encoded, url = false) {
  if (Uint8Array.fromBase64)
    return Uint8Array.fromBase64(encoded, { alphabet: url ? "base64url" : "base64" });
  if (url) {
    if (encoded.includes("+") || encoded.includes("/"))
      throw new TypeError("Invalid base64url");
    encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  }
  const binary = atob(encoded), bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++)
    bytes[i] = binary.charCodeAt(i);
  return bytes;
}
async function digest(algorithm, data) {
  const subtleDigest = `SHA-${algorithm.slice(-3)}`;
  return new Uint8Array(await crypto.subtle.digest(subtleDigest, data));
}

// node_modules/jose/dist/webapi/util/errors.js
var JOSEError = class extends Error {
  static code = "ERR_JOSE_GENERIC";
  code = "ERR_JOSE_GENERIC";
  constructor(message2, options) {
    super(message2, options), this.name = this.constructor.name, Error.captureStackTrace?.(this, this.constructor);
  }
};
var JWTClaimValidationFailed = class extends JOSEError {
  static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } }), this.claim = claim, this.reason = reason, this.payload = payload;
  }
};
var JWTExpired = class extends JOSEError {
  static code = "ERR_JWT_EXPIRED";
  code = "ERR_JWT_EXPIRED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } }), this.claim = claim, this.reason = reason, this.payload = payload;
  }
};
var JOSEAlgNotAllowed = class extends JOSEError {
  static code = "ERR_JOSE_ALG_NOT_ALLOWED";
  code = "ERR_JOSE_ALG_NOT_ALLOWED";
};
var JOSENotSupported = class extends JOSEError {
  static code = "ERR_JOSE_NOT_SUPPORTED";
  code = "ERR_JOSE_NOT_SUPPORTED";
};
var JWEDecryptionFailed = class extends JOSEError {
  static code = "ERR_JWE_DECRYPTION_FAILED";
  code = "ERR_JWE_DECRYPTION_FAILED";
  constructor(message2 = "decryption operation failed", options) {
    super(message2, options);
  }
};
var JWEInvalid = class extends JOSEError {
  static code = "ERR_JWE_INVALID";
  code = "ERR_JWE_INVALID";
};
var JWSInvalid = class extends JOSEError {
  static code = "ERR_JWS_INVALID";
  code = "ERR_JWS_INVALID";
};
var JWTInvalid = class extends JOSEError {
  static code = "ERR_JWT_INVALID";
  code = "ERR_JWT_INVALID";
};
var JWKSInvalid = class extends JOSEError {
  static code = "ERR_JWKS_INVALID";
  code = "ERR_JWKS_INVALID";
};
var JWKSNoMatchingKey = class extends JOSEError {
  static code = "ERR_JWKS_NO_MATCHING_KEY";
  code = "ERR_JWKS_NO_MATCHING_KEY";
  constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
    super(message2, options);
  }
};
var JWKSMultipleMatchingKeys = class extends JOSEError {
  [Symbol.asyncIterator] = async function* () {
  };
  static code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
    super(message2, options);
  }
};
var JWKSTimeout = class extends JOSEError {
  static code = "ERR_JWKS_TIMEOUT";
  code = "ERR_JWKS_TIMEOUT";
  constructor(message2 = "request timed out", options) {
    super(message2, options);
  }
};
var JWSSignatureVerificationFailed = class extends JOSEError {
  static code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
  }
};

// node_modules/jose/dist/webapi/util/base64url.js
var invalid = "The input to be decoded is not correctly encoded.";
function decode(input) {
  try {
    return decodeBase64(typeof input == "string" ? input : decoder2.decode(input), true);
  } catch (cause) {
    throw new TypeError(invalid, { cause });
  }
}
function encode2(input) {
  return encodeBase64(typeof input == "string" ? encoder2.encode(input) : input, true);
}

// node_modules/jose/dist/webapi/lib/validate.js
function assertUint8Array(input, label) {
  if (!(input instanceof Uint8Array))
    throw new TypeError(`${label} must be an instance of Uint8Array`);
}
function isObject(input) {
  if (typeof input != "object" || input === null || Object.prototype.toString.call(input) !== "[object Object]")
    return false;
  const prototype = Object.getPrototypeOf(input);
  return prototype === null || Object.getPrototypeOf(prototype) === null;
}
function isJwkSet(input) {
  return isObject(input) && Array.isArray(input.keys) && Array.from(input.keys).every(isObject);
}
function isDisjoint(...headers2) {
  const parameters = /* @__PURE__ */ new Set();
  for (const header of headers2)
    if (header)
      for (const parameter of Object.keys(header)) {
        if (parameters.has(parameter))
          return false;
        parameters.add(parameter);
      }
  return true;
}
function assertNotSet(value, name) {
  if (value !== void 0)
    throw new TypeError(`${name} can only be called once`);
}
function decodeBase64url(value, label, ErrorClass) {
  try {
    return decode(value);
  } catch (cause) {
    throw new ErrorClass(`Failed to base64url decode the ${label}`, { cause });
  }
}
function encodeAsciiMember(value, label, ErrorClass) {
  try {
    return encode(value);
  } catch (cause) {
    throw new ErrorClass(`The ${label} is not a valid base64url string`, { cause });
  }
}
function parseJoseHeader(encodedProtectedHeader, ErrorClass, message2) {
  let parsed;
  try {
    parsed = JSON.parse(strictDecoder.decode(decode(encodedProtectedHeader)));
  } catch (cause) {
    throw new ErrorClass(message2, { cause });
  }
  if (!isObject(parsed))
    throw new ErrorClass(message2);
  return parsed;
}
var JWS_RECOGNIZED = { __proto__: null, b64: true };
var JWE_RECOGNIZED = { __proto__: null };
function validateAlgorithms(option, algorithms) {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s != "string")))
    throw new TypeError(`"${option}" option must be an array of strings`);
  return algorithms === void 0 ? void 0 : new Set(algorithms);
}
function validateCritDuplicates(Err, protectedHeader) {
  const { crit } = protectedHeader ?? {};
  if (Array.isArray(crit) && new Set(crit).size !== crit.length)
    throw new Err('"crit" (Critical) Header Parameter MUST NOT contain duplicate values');
}
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0)
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  if (!protectedHeader || protectedHeader.crit === void 0)
    return [];
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input != "string" || input.length === 0))
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  const recognized = recognizedOption === void 0 ? recognizedDefault : { __proto__: null, ...recognizedOption, ...recognizedDefault };
  for (const parameter of protectedHeader.crit) {
    if (!(parameter in recognized))
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    if (!Object.hasOwn(joseHeader, parameter) || joseHeader[parameter] === void 0)
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    if (recognized[parameter] && (!Object.hasOwn(protectedHeader, parameter) || protectedHeader[parameter] === void 0))
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
  }
  return protectedHeader.crit;
}
function validateB64(protectedHeader, extensions) {
  if (extensions.includes("b64")) {
    const b64 = protectedHeader.b64;
    if (typeof b64 != "boolean")
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    return b64;
  }
  return true;
}
function serializeJoseHeader(Err, header) {
  let serialized, parsed;
  try {
    serialized = JSON.stringify(header), parsed = JSON.parse(serialized);
  } catch (cause) {
    throw new Err("JOSE Header is not valid JSON", { cause });
  }
  if (!isObject(parsed))
    throw new Err("JOSE Header is not a JSON object");
  return [parsed, serialized];
}

// node_modules/jose/dist/webapi/lib/key.js
var tag = (key) => key[Symbol.toStringTag];
var jwkMatchesOp = (entry, key, usage) => {
  const { alg } = entry;
  if (key.use !== void 0) {
    const expected = usage === "sign" || usage === "verify" ? "sig" : "enc";
    if (key.use !== expected)
      throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
  }
  if (key.alg !== void 0 && key.alg !== alg)
    throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
  if (Array.isArray(key.key_ops)) {
    const expectedKeyOp = usage === "encrypt" || usage === "decrypt" ? entry.ops?.[usage === "encrypt" ? 0 : 1] : usage;
    if (expectedKeyOp && !key.key_ops.includes(expectedKeyOp))
      throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
  }
};
async function prepareKey(entry, key, usage) {
  const { alg, secret } = entry, requiresPrivateKey = usage === "decrypt" || usage === "sign";
  if (secret && key instanceof Uint8Array)
    return key;
  let normalized, keyObject;
  if (isObject(key)) {
    if (normalized = normalizeJwk(key), typeof normalized.kty != "string")
      throw invalidKeyType(alg, key, secret);
    if (!(secret ? normalized.kty === "oct" && typeof normalized.k == "string" : normalized.kty !== "oct" && (requiresPrivateKey ? normalized.kty === "AKP" && typeof normalized.priv == "string" || typeof normalized.d == "string" : normalized.d === void 0 && normalized.priv === void 0)))
      throw new TypeError(secret ? 'JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present' : `JSON Web Key for this operation must be a ${requiresPrivateKey ? "private" : "public"} JWK`);
    if (jwkMatchesOp(entry, normalized, usage), normalized.kty === "oct")
      return decode(normalized.k);
    if (!Object.isFrozen(key)) {
      const { key_ops } = key;
      Array.isArray(key_ops) && Object.freeze(key_ops), Object.freeze(key);
    }
  } else {
    if (!isKeyLike(key))
      throw invalidKeyType(alg, key, secret);
    const expectedType = secret ? "secret" : requiresPrivateKey ? "private" : "public";
    if (key.type !== expectedType && (secret || ["secret", "public", "private"].includes(key.type)))
      throw new TypeError(`${tag(key)} instances must be of type "${expectedType}" for the ${alg} algorithm`);
    if (isCryptoKey(key))
      return key;
    if (keyObject = key, keyObject.type === "secret")
      return keyObject.export();
  }
  cache ||= /* @__PURE__ */ new WeakMap();
  const cacheKey = key;
  let cached = cache.get(cacheKey);
  if (cached?.[alg])
    return cached[alg];
  if (cached || cache.set(cacheKey, cached = {}), keyObject && typeof keyObject.toCryptoKey == "function") {
    const isPublic = keyObject.type === "public", crv = nist[keyObject.asymmetricKeyDetails?.namedCurve], params = entry.resolve?.({ crv, asymmetricKeyType: keyObject.asymmetricKeyType }) ?? entry.subtle;
    return cached[alg] = keyObject.toCryptoKey(params, isPublic, entry.usages[isPublic ? 0 : 1]);
  }
  return normalized ??= keyObject.export({ format: "jwk" }), normalized.alg = alg, cached[alg] = await jwkToKey(entry, normalized);
}
var cache;
var nist = {
  __proto__: null,
  prime256v1: "P-256",
  secp384r1: "P-384",
  secp521r1: "P-521"
};
function assertCryptoKey(key) {
  if (!isCryptoKey(key))
    throw new Error("CryptoKey instance expected");
}
var isCryptoKey = (key) => {
  if (key?.[Symbol.toStringTag] === "CryptoKey")
    return true;
  try {
    return key instanceof CryptoKey;
  } catch {
    return false;
  }
};
var isKeyObject = (key) => key?.[Symbol.toStringTag] === "KeyObject";
var isKeyLike = (key) => isCryptoKey(key) || isKeyObject(key);
function message(msg, actual, ...types) {
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else types.length === 2 ? msg += `one of type ${types[0]} or ${types[1]}.` : msg += `of type ${types[0]}.`;
  return actual == null ? msg += ` Received ${actual}` : typeof actual == "function" && actual.name ? msg += ` Received function ${actual.name}` : typeof actual == "object" && actual != null && actual.constructor?.name && (msg += ` Received an instance of ${actual.constructor.name}`), msg;
}
var invalidKeyInput = (actual, ...types) => message("Key must be ", actual, ...types);
function invalidKeyType(alg, actual, secret) {
  const types = ["CryptoKey", "KeyObject", "JSON Web Key"];
  return secret && types.push("Uint8Array"), new TypeError(message(`Key for the ${alg} algorithm must be `, actual, ...types));
}
var unusable = (name, prop = "algorithm.name") => new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage))
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
}
function checkModulusLength(alg, key) {
  const { modulusLength } = key.algorithm;
  if (typeof modulusLength != "number" || modulusLength < 2048)
    throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
}
function checkCryptoKey(key, expected, usage) {
  const algorithm = key.algorithm;
  if (algorithm.name !== expected.name)
    throw unusable(expected.name);
  if (expected.hash && algorithm.hash?.name !== expected.hash)
    throw unusable(expected.hash, "algorithm.hash");
  if (expected.namedCurve && algorithm.namedCurve !== expected.namedCurve)
    throw unusable(expected.namedCurve, "algorithm.namedCurve");
  if (expected.length !== void 0 && algorithm.length !== expected.length)
    throw unusable(expected.length, "algorithm.length");
  checkUsage(key, usage);
}
function snapshotJwk(jwk) {
  return { __proto__: null, ...jwk };
}
function normalizeJwk(jwk) {
  const normalized = snapshotJwk(jwk);
  if (normalized.ext !== void 0 && typeof normalized.ext != "boolean")
    throw new TypeError('"ext" (Extractable) Parameter must be a boolean');
  if (normalized.key_ops !== void 0) {
    const value = normalized.key_ops, keyOps = Array.isArray(value) ? [...value] : void 0;
    if (!keyOps || keyOps.some((operation) => typeof operation != "string") || new Set(keyOps).size !== keyOps.length)
      throw new TypeError('"key_ops" (Key Operations) Parameter must be an array of unique strings');
    normalized.key_ops = keyOps;
  }
  return normalized;
}
async function jwkToKey(entry, jwk, extractable) {
  if (!entry.kty.includes(jwk.kty))
    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
  const algorithm = entry.resolve?.({ kty: jwk.kty, crv: jwk.crv }) ?? entry.subtle, isPrivate = !!(jwk.d || jwk.priv), keyData = { ...jwk, ext: extractable ?? jwk.ext };
  return keyData.kty !== "AKP" && delete keyData.alg, delete keyData.use, crypto.subtle.importKey("jwk", keyData, algorithm, keyData.ext ?? !isPrivate, jwk.key_ops ?? entry.usages[isPrivate ? 1 : 0]);
}
async function rawKey(key, expected, usage, extractable = false) {
  return key instanceof Uint8Array && (key = await crypto.subtle.importKey("raw", key, expected, extractable, [usage])), checkCryptoKey(key, expected, usage), key;
}

// node_modules/jose/dist/webapi/lib/content_encryption.js
var generateCek = (enc) => crypto.getRandomValues(new Uint8Array(enc.cekBits >> 3));
function checkCekLength(cek, expected) {
  const actual = cek.byteLength << 3;
  if (actual !== expected)
    throw new JWEInvalid(`Invalid Content Encryption Key length. Expected ${expected} bits, got ${actual} bits`);
}
var generateIv = (enc) => crypto.getRandomValues(new Uint8Array(enc.ivBits >> 3));
function checkIvLength(enc, iv) {
  if (iv.length << 3 !== enc.ivBits)
    throw new JWEInvalid("Invalid Initialization Vector length");
}
async function cbcKeySetup(enc, cek, usage) {
  if (!(cek instanceof Uint8Array))
    throw new TypeError(invalidKeyInput(cek, "Uint8Array"));
  const keyLengthBits = enc.cekBits >> 1, encKey = await crypto.subtle.importKey("raw", cek.subarray(keyLengthBits >> 3), "AES-CBC", false, [usage]), macKey = await crypto.subtle.importKey("raw", cek.subarray(0, keyLengthBits >> 3), {
    hash: `SHA-${keyLengthBits << 1}`,
    name: "HMAC"
  }, false, ["sign"]);
  return [encKey, macKey, keyLengthBits];
}
async function cbcHmacTag(macKey, macData, keyLengthBits) {
  return new Uint8Array((await crypto.subtle.sign("HMAC", macKey, macData)).slice(0, keyLengthBits >> 3));
}
async function cbcEncrypt(enc, plaintext, cek, iv, aad) {
  const [encKey, macKey, keyLengthBits] = await cbcKeySetup(enc, cek, "encrypt"), ciphertext = new Uint8Array(await crypto.subtle.encrypt({
    iv,
    name: "AES-CBC"
  }, encKey, plaintext)), al = uint64be(aad.length * 8), macData = concat(aad, iv, ciphertext, al), tag2 = await cbcHmacTag(macKey, macData, keyLengthBits);
  return { ciphertext, tag: tag2, iv };
}
async function timingSafeEqual(a, b) {
  const algorithm = { name: "HMAC", hash: "SHA-256" }, key = await crypto.subtle.generateKey(algorithm, false, ["sign", "verify"]), aHmac = await crypto.subtle.sign(algorithm, key, a);
  return crypto.subtle.verify(algorithm, key, aHmac, b);
}
async function cbcDecrypt(enc, cek, ciphertext, iv, tag2, aad) {
  const [encKey, macKey, keyLengthBits] = await cbcKeySetup(enc, cek, "decrypt"), al = uint64be(aad.length * 8), macData = concat(aad, iv, ciphertext, al), expectedTag = await cbcHmacTag(macKey, macData, keyLengthBits);
  try {
    if (await timingSafeEqual(tag2, expectedTag))
      return new Uint8Array(await crypto.subtle.decrypt({ iv, name: "AES-CBC" }, encKey, ciphertext));
  } catch {
  }
  throw new JWEDecryptionFailed();
}
async function encrypt(enc, plaintext, cek, iv, aad) {
  if (!isCryptoKey(cek) && !(cek instanceof Uint8Array))
    throw new TypeError(invalidKeyInput(cek, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
  if (iv ? checkIvLength(enc, iv) : iv = generateIv(enc), cek instanceof Uint8Array && checkCekLength(cek, enc.cekBits), enc.cbc)
    return cbcEncrypt(enc, plaintext, cek, iv, aad);
  const encKey = await rawKey(cek, enc.subtle, "encrypt"), encrypted = new Uint8Array(await crypto.subtle.encrypt({
    additionalData: aad,
    iv,
    name: "AES-GCM",
    tagLength: 128
  }, encKey, plaintext));
  return { ciphertext: encrypted.subarray(0, -16), tag: encrypted.subarray(-16), iv };
}
async function decrypt(enc, cek, ciphertext, iv, tag2, aad) {
  if (!isCryptoKey(cek) && !(cek instanceof Uint8Array))
    throw new TypeError(invalidKeyInput(cek, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
  if (!iv)
    throw new JWEInvalid("JWE Initialization Vector missing");
  if (!tag2)
    throw new JWEInvalid("JWE Authentication Tag missing");
  if (!enc.cbc && tag2.length !== 16)
    throw new JWEInvalid("Invalid Authentication Tag length");
  if (checkIvLength(enc, iv), cek instanceof Uint8Array && checkCekLength(cek, enc.cekBits), enc.cbc)
    return cbcDecrypt(enc, cek, ciphertext, iv, tag2, aad);
  const encKey = await rawKey(cek, enc.subtle, "decrypt");
  try {
    return new Uint8Array(await crypto.subtle.decrypt({
      additionalData: aad,
      iv,
      name: "AES-GCM",
      tagLength: 128
    }, encKey, concat(ciphertext, tag2)));
  } catch {
    throw new JWEDecryptionFailed();
  }
}

// node_modules/jose/dist/webapi/lib/key_descriptor.js
function table(entries) {
  const out = { __proto__: null };
  for (const alg in entries)
    out[alg] = { ...entries[alg], alg };
  return out;
}

// node_modules/jose/dist/webapi/lib/jwe_algorithms.js
var wrap = [
  ["encrypt", "wrapKey"],
  ["decrypt", "unwrapKey"]
];
var derive = [[], ["deriveBits"]];
var none = [[], []];
function rsaes(bits) {
  return {
    kty: ["RSA"],
    mode: "key-encryption",
    subtle: { name: "RSA-OAEP", hash: `SHA-${bits}` },
    usages: wrap,
    ops: ["wrapKey", "unwrapKey"]
  };
}
function ecdh(mode) {
  return {
    kty: ["EC", "OKP"],
    mode,
    subtle: { name: "ECDH" },
    resolve: ({ kty, crv, asymmetricKeyType }) => {
      if (crv === "X25519" || asymmetricKeyType === "x25519")
        return { name: "X25519" };
      if (kty === "OKP")
        throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      return { name: "ECDH", namedCurve: crv };
    },
    usages: derive,
    ops: [void 0, "deriveBits"]
  };
}
function aeskw(bits, gcm = false) {
  return {
    kty: ["oct"],
    mode: "key-wrapping",
    secret: true,
    subtle: { name: gcm ? "AES-GCM" : "AES-KW", length: bits },
    usages: none,
    ops: gcm ? ["encrypt", "decrypt"] : ["wrapKey", "unwrapKey"]
  };
}
function pbes2() {
  return {
    kty: ["oct"],
    mode: "key-wrapping",
    secret: true,
    subtle: { name: "PBKDF2" },
    usages: none,
    ops: ["deriveBits", "deriveBits"]
  };
}
var JWE = table({
  dir: {
    kty: ["oct"],
    mode: "direct-encryption",
    secret: true,
    subtle: { name: "AES-GCM" },
    usages: none,
    ops: ["encrypt", "decrypt"]
  },
  "RSA-OAEP": rsaes(1),
  "RSA-OAEP-256": rsaes(256),
  "RSA-OAEP-384": rsaes(384),
  "RSA-OAEP-512": rsaes(512),
  "ECDH-ES": ecdh("direct-key-agreement"),
  "ECDH-ES+A128KW": ecdh("key-agreement-with-key-wrapping"),
  "ECDH-ES+A192KW": ecdh("key-agreement-with-key-wrapping"),
  "ECDH-ES+A256KW": ecdh("key-agreement-with-key-wrapping"),
  A128KW: aeskw(128),
  A192KW: aeskw(192),
  A256KW: aeskw(256),
  A128GCMKW: aeskw(128, true),
  A192GCMKW: aeskw(192, true),
  A256GCMKW: aeskw(256, true),
  "PBES2-HS256+A128KW": pbes2(),
  "PBES2-HS384+A192KW": pbes2(),
  "PBES2-HS512+A256KW": pbes2()
});
var contentOps = ["encrypt", "decrypt"];
function contentEncryption(bits, cbc = false) {
  return {
    kty: ["oct"],
    secret: true,
    subtle: { name: cbc ? "AES-CBC" : "AES-GCM", length: bits },
    usages: none,
    ops: contentOps,
    cekBits: bits,
    ivBits: cbc ? 128 : 96,
    cbc
  };
}
var ENC = table({
  A128GCM: contentEncryption(128),
  A192GCM: contentEncryption(192),
  A256GCM: contentEncryption(256),
  "A128CBC-HS256": contentEncryption(256, true),
  "A192CBC-HS384": contentEncryption(384, true),
  "A256CBC-HS512": contentEncryption(512, true)
});
function unsupported(parameter, name) {
  throw new JOSENotSupported(`Invalid or unsupported "${parameter}" (JWE ${name}) header value`);
}
function jweAlgorithm(alg) {
  return (typeof alg == "string" ? JWE[alg] : void 0) ?? unsupported("alg", "Algorithm");
}
function isJWECEKTransport(algorithm) {
  return algorithm.mode === "key-wrapping" || algorithm.mode === "key-encryption" || algorithm.mode === "key-agreement-with-key-wrapping";
}
function jweEncryption(enc) {
  return (typeof enc == "string" ? ENC[enc] : void 0) ?? unsupported("enc", "Encryption Algorithm");
}

// node_modules/jose/dist/webapi/lib/key_management.js
function checkEcdhCryptoKey(key, usage) {
  if (key.algorithm.name !== "ECDH" && key.algorithm.name !== "X25519")
    throw new TypeError("CryptoKey does not support this operation, its algorithm.name must be ECDH or X25519");
  checkUsage(key, usage);
}
async function aeskwWrap(alg, key, cek) {
  const cryptoKey = await rawKey(key, jweAlgorithm(alg).subtle, "wrapKey", true), cryptoKeyCek = await crypto.subtle.importKey("raw", cek, { hash: "SHA-256", name: "HMAC" }, true, ["sign"]);
  return new Uint8Array(await crypto.subtle.wrapKey("raw", cryptoKeyCek, cryptoKey, "AES-KW"));
}
async function aeskwUnwrap(alg, key, encryptedKey) {
  const cryptoKey = await rawKey(key, jweAlgorithm(alg).subtle, "unwrapKey", true), cryptoKeyCek = await crypto.subtle.unwrapKey("raw", encryptedKey, cryptoKey, "AES-KW", { hash: "SHA-256", name: "HMAC" }, true, ["sign"]);
  return new Uint8Array(await crypto.subtle.exportKey("raw", cryptoKeyCek));
}
function checkRsaKey(alg, key, usage) {
  checkCryptoKey(key, jweAlgorithm(alg).subtle, usage), checkModulusLength(alg, key);
}
async function deriveKey(p2s, alg, p2c, key) {
  if (!(p2s instanceof Uint8Array) || p2s.length < 8)
    throw new JWEInvalid("PBES2 Salt Input must be 8 or more octets");
  if (!Number.isSafeInteger(p2c) || Math.sign(p2c) !== 1)
    throw new JWEInvalid("PBES2 Count Input must be a positive integer");
  const salt = concat(encode(alg), Uint8Array.of(0), p2s), keyLengthBits = parseInt(alg.slice(13, 16), 10), subtleAlg = {
    hash: `SHA-${alg.slice(8, 11)}`,
    iterations: p2c,
    name: "PBKDF2",
    salt
  }, cryptoKey = await rawKey(key, jweAlgorithm(alg).subtle, "deriveBits");
  return new Uint8Array(await crypto.subtle.deriveBits(subtleAlg, cryptoKey, keyLengthBits));
}
function lengthAndInput(input) {
  return concat(uint32be(input.length), input);
}
async function concatKdf(Z, keyDataLength, OtherInfo) {
  const dkLen = keyDataLength >> 3, hashLen = 32, reps = Math.ceil(dkLen / hashLen), dk = new Uint8Array(reps * hashLen);
  for (let i = 1; i <= reps; i++) {
    const hashResult = await digest("sha256", concat(uint32be(i), Z, OtherInfo));
    dk.set(hashResult, (i - 1) * hashLen);
  }
  return dk.slice(0, dkLen);
}
async function ecdhesDeriveKey(publicKey, privateKey, algorithmId, keyDataLength, apu = new Uint8Array(), apv = new Uint8Array()) {
  checkEcdhCryptoKey(publicKey), checkEcdhCryptoKey(privateKey, "deriveBits");
  const otherInfo = concat(lengthAndInput(encode(algorithmId)), lengthAndInput(apu), lengthAndInput(apv), uint32be(keyDataLength)), Z = new Uint8Array(await crypto.subtle.deriveBits({
    name: publicKey.algorithm.name,
    public: publicKey
  }, privateKey, publicKey.algorithm.name === "X25519" ? 256 : Math.ceil(parseInt(publicKey.algorithm.namedCurve.slice(-3), 10) / 8) << 3));
  return concatKdf(Z, keyDataLength, otherInfo);
}
function assertEcdhKey(key) {
  assertCryptoKey(key);
  const curve = key.algorithm.namedCurve;
  if (curve !== "P-256" && curve !== "P-384" && curve !== "P-521" && key.algorithm.name !== "X25519")
    throw new JOSENotSupported("ECDH with the provided key is not allowed or not supported by your javascript runtime");
}
function partyInfo(joseHeader, name) {
  const value = joseHeader[name];
  if (value !== void 0) {
    if (typeof value != "string")
      throw new JWEInvalid(`JOSE Header "${name}" (Agreement Party${name === "apu" ? "U" : "V"}Info) invalid`);
    return decodeBase64url(value, name, JWEInvalid);
  }
}
function checkPartyInfo(apu, apv) {
  if (!(apu === void 0 || apv === void 0 || apu.byteLength !== apv.byteLength)) {
    for (let i = 0; i < apu.byteLength; i++)
      if (apu[i] !== apv[i])
        return;
    throw new JWEInvalid('JOSE Header "apu" and "apv" values must be distinct');
  }
}
function assertEncryptedKey(encryptedKey) {
  if (encryptedKey === void 0)
    throw new JWEInvalid("JWE Encrypted Key missing");
}
function assertNoEncryptedKey(encryptedKey) {
  if (encryptedKey !== void 0)
    throw new JWEInvalid("Encountered unexpected JWE Encrypted Key");
}
function validateMaxPBES2Count(value) {
  if (value !== void 0 && value !== 1 / 0 && (!Number.isSafeInteger(value) || value < 1))
    throw new TypeError("maxPBES2Count must be a positive safe integer or Infinity");
}
async function decryptKeyManagement(entry, enc, key, encryptedKey, joseHeader, maxPBES2Count) {
  const { alg } = entry, mode = entry.mode;
  if (mode === "direct-encryption")
    return assertNoEncryptedKey(encryptedKey), key;
  const direct = mode === "direct-key-agreement";
  switch (direct ? assertNoEncryptedKey(encryptedKey) : assertEncryptedKey(encryptedKey), entry.subtle.name) {
    case "ECDH": {
      const { epk } = joseHeader;
      if (!isObject(epk) || ["d", "k", "p", "q", "dp", "dq", "qi", "oth", "priv"].some((parameter) => Object.hasOwn(epk, parameter)))
        throw new JWEInvalid('JOSE Header "epk" (Ephemeral Public Key) missing or invalid');
      assertEcdhKey(key);
      const ephemeralPublicKey = await jwkToKey(entry, epk), partyUInfo = partyInfo(joseHeader, "apu"), partyVInfo = partyInfo(joseHeader, "apv");
      checkPartyInfo(partyUInfo, partyVInfo);
      const derivedKey = await ecdhesDeriveKey(ephemeralPublicKey, key, direct ? enc.alg : alg, direct ? enc.cekBits : parseInt(alg.slice(-5, -2), 10), partyUInfo, partyVInfo);
      if (direct)
        return derivedKey;
      key = derivedKey;
      break;
    }
    case "RSA-OAEP":
      return assertCryptoKey(key), checkRsaKey(alg, key, "decrypt"), new Uint8Array(await crypto.subtle.decrypt("RSA-OAEP", key, encryptedKey));
    case "PBKDF2": {
      if (typeof joseHeader.p2c != "number")
        throw new JWEInvalid('JOSE Header "p2c" (PBES2 Count) missing or invalid');
      const p2cLimit = maxPBES2Count ?? 1e4;
      if (joseHeader.p2c > p2cLimit)
        throw new JWEInvalid('JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds');
      if (typeof joseHeader.p2s != "string")
        throw new JWEInvalid('JOSE Header "p2s" (PBES2 Salt) missing or invalid');
      const p2s = decodeBase64url(joseHeader.p2s, "p2s", JWEInvalid);
      key = await deriveKey(p2s, alg, joseHeader.p2c, key);
      break;
    }
    case "AES-GCM": {
      if (typeof joseHeader.iv != "string")
        throw new JWEInvalid('JOSE Header "iv" (Initialization Vector) missing or invalid');
      if (typeof joseHeader.tag != "string")
        throw new JWEInvalid('JOSE Header "tag" (Authentication Tag) missing or invalid');
      const iv = decodeBase64url(joseHeader.iv, "iv", JWEInvalid), tag2 = decodeBase64url(joseHeader.tag, "tag", JWEInvalid);
      if (iv.byteLength !== 12)
        throw new JWEInvalid("Invalid Initialization Vector length");
      if (tag2.byteLength !== 16)
        throw new JWEInvalid("Invalid Authentication Tag length");
      return decrypt(jweEncryption(alg.slice(0, -2)), key, encryptedKey, iv, tag2, new Uint8Array());
    }
  }
  return aeskwUnwrap(alg.slice(-6), key, encryptedKey);
}
async function encryptKeyManagement(entry, enc, inputKey, joseHeader, providedCek, providedParameters = {}) {
  const { alg, mode } = entry, transport = isJWECEKTransport(entry);
  if (providedCek !== void 0 && !transport)
    throw new TypeError(`setContentEncryptionKey cannot be called with JWE "alg" (Algorithm) Header ${alg}`);
  let key = await prepareKey(mode === "direct-encryption" ? enc : entry, inputKey, "encrypt");
  if (mode === "direct-encryption")
    return [key, void 0, void 0];
  const cek = transport ? providedCek ?? generateCek(enc) : void 0;
  cek && checkCekLength(cek, enc.cekBits);
  let encryptedKey, parameters;
  switch (entry.subtle.name) {
    case "ECDH": {
      assertEcdhKey(key);
      const { apu: providedApu, apv: providedApv } = providedParameters;
      providedApu !== void 0 && assertUint8Array(providedApu, '"apu"'), providedApv !== void 0 && assertUint8Array(providedApv, '"apv"');
      const apu = providedApu ?? partyInfo(joseHeader, "apu"), apv = providedApv ?? partyInfo(joseHeader, "apv");
      checkPartyInfo(apu, apv);
      let ephemeralPrivateKey;
      providedParameters.epk !== void 0 ? ephemeralPrivateKey = await prepareKey(entry, providedParameters.epk, "decrypt") : ephemeralPrivateKey = (await crypto.subtle.generateKey(key.algorithm, true, ["deriveBits"])).privateKey;
      const subtle = crypto.subtle;
      let exportableEpk = ephemeralPrivateKey;
      if (!exportableEpk.extractable) {
        if (typeof subtle.getPublicKey != "function")
          throw new TypeError('CryptoKey for "epk" must be extractable');
        exportableEpk = await subtle.getPublicKey(ephemeralPrivateKey, []);
      }
      const { x, y, crv, kty } = await subtle.exportKey("jwk", exportableEpk), direct = mode === "direct-key-agreement", derivedKey = await ecdhesDeriveKey(key, ephemeralPrivateKey, direct ? enc.alg : alg, direct ? enc.cekBits : parseInt(alg.slice(-5, -2), 10), apu, apv), epk = { x, crv, kty };
      if (kty === "EC" && (epk.y = y), parameters = { epk }, providedApu !== void 0 && (parameters.apu = encode2(providedApu)), providedApv !== void 0 && (parameters.apv = encode2(providedApv)), direct)
        return [derivedKey, void 0, parameters];
      key = derivedKey;
      break;
    }
    case "RSA-OAEP": {
      assertCryptoKey(key), checkRsaKey(alg, key, "encrypt"), encryptedKey = new Uint8Array(await crypto.subtle.encrypt("RSA-OAEP", key, cek));
      break;
    }
    case "PBKDF2": {
      const { p2c = 2048, p2s = crypto.getRandomValues(new Uint8Array(16)) } = providedParameters;
      key = await deriveKey(p2s, alg, p2c, key), parameters = { p2c, p2s: encode2(p2s) };
      break;
    }
    case "AES-GCM": {
      const iv = providedParameters.iv === void 0 ? crypto.getRandomValues(new Uint8Array(12)) : providedParameters.iv;
      if (!(iv instanceof Uint8Array))
        throw new TypeError('"iv" must be an instance of Uint8Array');
      const wrapped = await encrypt(jweEncryption(alg.slice(0, -2)), cek, key, iv, new Uint8Array());
      encryptedKey = wrapped.ciphertext, parameters = { iv: encode2(wrapped.iv), tag: encode2(wrapped.tag) };
    }
  }
  if (encryptedKey ??= await aeskwWrap(alg.slice(-6), key, cek), !(encryptedKey instanceof Uint8Array) || !encryptedKey.byteLength)
    throw new TypeError("JWE key management algorithm did not produce an Encrypted Key");
  return [cek, encryptedKey, parameters];
}

// node_modules/jose/dist/webapi/lib/deflate.js
function validateZip(joseHeader, protectedHeader) {
  if (joseHeader.zip !== void 0 && joseHeader.zip !== "DEF")
    throw new JOSENotSupported('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value.');
  if (joseHeader.zip !== void 0 && !protectedHeader?.zip)
    throw new JWEInvalid('JWE "zip" (Compression Algorithm) Header Parameter MUST be in a protected header.');
}
function supported(name) {
  if (typeof globalThis[name] > "u")
    throw new JOSENotSupported(`JWE "zip" (Compression Algorithm) Header Parameter requires the ${name} API.`);
}
async function transform(stream, input, maxLength = 1 / 0) {
  const writer = stream.writable.getWriter();
  writer.write(input).catch(() => {
  }), writer.close().catch(() => {
  });
  const chunks = [];
  let length = 0;
  const reader = stream.readable.getReader();
  for (; ; ) {
    const { value, done } = await reader.read();
    if (done)
      break;
    if (chunks.push(value), length += value.byteLength, maxLength !== 1 / 0 && length > maxLength)
      throw await reader.cancel().catch(() => {
      }), new JWEInvalid("Decompressed plaintext exceeded the configured limit");
  }
  return concat(...chunks);
}
async function compress(input) {
  return supported("CompressionStream"), transform(new CompressionStream("deflate-raw"), input);
}
async function decompress(input, maxLength) {
  return supported("DecompressionStream"), transform(new DecompressionStream("deflate-raw"), input, maxLength);
}

// node_modules/jose/dist/webapi/lib/jwe_decrypt.js
function shareJWE(jwe) {
  const { protected: encodedProtected, ciphertext, iv, tag: tag2, aad } = jwe;
  let protectedHeader;
  return encodedProtected !== void 0 && (protectedHeader = parseJoseHeader(encodedProtected, JWEInvalid, "JWE Protected Header is invalid")), [
    protectedHeader,
    decodeBase64url(ciphertext, "ciphertext", JWEInvalid),
    iv !== void 0 ? decodeBase64url(iv, "iv", JWEInvalid) : void 0,
    tag2 !== void 0 ? decodeBase64url(tag2, "tag", JWEInvalid) : void 0,
    encodeAsciiMember((encodedProtected ?? "") + (aad !== void 0 ? `.${aad}` : ""), "aad", JWEInvalid)
  ];
}
function prepareDecrypt(options) {
  const keyManagementAlgorithms = options && validateAlgorithms("keyManagementAlgorithms", options.keyManagementAlgorithms), contentEncryptionAlgorithms = options && validateAlgorithms("contentEncryptionAlgorithms", options.contentEncryptionAlgorithms), { crit, maxPBES2Count, maxDecompressedLength } = options ?? {};
  validateMaxPBES2Count(maxPBES2Count);
  const decompressionLimit = maxDecompressedLength ?? 25e4;
  if (decompressionLimit !== 0 && decompressionLimit !== 1 / 0 && (!Number.isSafeInteger(decompressionLimit) || decompressionLimit < 1))
    throw new TypeError("maxDecompressedLength must be 0, a positive safe integer, or Infinity");
  return [
    keyManagementAlgorithms,
    contentEncryptionAlgorithms,
    crit,
    maxPBES2Count,
    maxDecompressedLength
  ];
}
async function decryptJWE(jwe, shared, key, token = shareJWE(jwe)) {
  const [protectedHeader, ciphertext, iv, tag2, additionalAuthenticatedData] = token, { header, unprotected, aad } = jwe;
  let joseHeader;
  if (header !== void 0 || unprotected !== void 0) {
    if (!isDisjoint(protectedHeader, header, unprotected))
      throw new JWEInvalid("JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint");
    joseHeader = { ...protectedHeader, ...header, ...unprotected };
  } else
    joseHeader = protectedHeader ?? {};
  const [keyManagementAlgorithms, contentEncryptionAlgorithms, crit, maxPBES2Count, maxDecompressedLength] = shared, { encrypted_key: encodedKey } = jwe;
  validateCrit(JWEInvalid, JWE_RECOGNIZED, crit, protectedHeader, joseHeader), validateZip(joseHeader, protectedHeader);
  const { alg, enc } = joseHeader;
  if (typeof alg != "string" || !alg)
    throw new JWEInvalid("missing JWE Algorithm (alg) in JWE Header");
  const selected = JWE[alg];
  if (encodedKey === "" && (!selected || !isJWECEKTransport(selected)))
    throw new JWEInvalid("JWE Encrypted Key incorrect type");
  const integrated = selected?.mode === "integrated-encryption";
  if (!integrated && (typeof enc != "string" || !enc))
    throw new JWEInvalid("missing JWE Encryption Algorithm (enc) in JWE Header");
  if (keyManagementAlgorithms && !keyManagementAlgorithms.has(alg) || !keyManagementAlgorithms && alg.startsWith("PBES2"))
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  let encEntry;
  if (integrated) {
    if (enc !== void 0)
      throw new JWEInvalid('JWE "enc" (Encryption Algorithm) Header Parameter must not be present for integrated encryption');
    if (iv?.byteLength)
      throw new JWEInvalid("JWE Initialization Vector must be empty for integrated encryption");
    if (tag2?.byteLength)
      throw new JWEInvalid("JWE Authentication Tag must be empty for integrated encryption");
  } else {
    if (contentEncryptionAlgorithms && !contentEncryptionAlgorithms.has(enc))
      throw new JOSEAlgNotAllowed('"enc" (Encryption Algorithm) Header Parameter value not allowed');
    encEntry = jweEncryption(enc);
  }
  let encryptedKey;
  if (encodedKey !== void 0)
    try {
      encryptedKey = decodeBase64url(encodedKey, "encrypted_key", JWEInvalid);
    } catch (error) {
      if (!selected || !isJWECEKTransport(selected))
        throw error;
      encryptedKey = new Uint8Array();
    }
  let resolvedKey = false;
  typeof key == "function" && (key = await key(protectedHeader, jwe), resolvedKey = true);
  const algEntry = selected ?? jweAlgorithm(alg);
  isJWECEKTransport(algEntry) && encryptedKey === void 0 && (encryptedKey = new Uint8Array());
  const k = await prepareKey(algEntry.mode === "direct-encryption" ? encEntry : algEntry, key, "decrypt");
  let plaintext;
  if (algEntry.mode === "integrated-encryption")
    plaintext = await algEntry.decrypt(k, encryptedKey, ciphertext, additionalAuthenticatedData, protectedHeader, joseHeader);
  else {
    const encryption = encEntry;
    let cek;
    try {
      cek = await decryptKeyManagement(algEntry, encryption, k, encryptedKey, joseHeader, maxPBES2Count), isJWECEKTransport(algEntry) && cek instanceof Uint8Array && cek.byteLength << 3 !== encryption.cekBits && (cek = generateCek(encryption));
    } catch (err) {
      if (err instanceof TypeError || err instanceof JWEInvalid || err instanceof JOSENotSupported)
        throw err;
      cek = generateCek(encryption);
    }
    plaintext = await decrypt(encryption, cek, ciphertext, iv, tag2, additionalAuthenticatedData);
  }
  if (joseHeader.zip === "DEF") {
    const decompressionLimit = maxDecompressedLength ?? 25e4;
    if (decompressionLimit === 0)
      throw new JOSENotSupported('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
    plaintext = await decompress(plaintext, decompressionLimit).catch((cause) => {
      throw cause instanceof JWEInvalid ? cause : new JWEInvalid("Failed to decompress plaintext", { cause });
    });
  }
  return {
    plaintext,
    ...protectedHeader && { protectedHeader },
    ...aad !== void 0 && {
      additionalAuthenticatedData: decodeBase64url(aad, "aad", JWEInvalid)
    },
    ...unprotected && { sharedUnprotectedHeader: unprotected },
    ...header && { unprotectedHeader: header },
    ...resolvedKey && { key: k }
  };
}
async function decryptCompact(jwe, shared, key) {
  if (jwe instanceof Uint8Array && (jwe = decoder2.decode(jwe)), typeof jwe != "string")
    throw new JWEInvalid("Compact JWE must be a string or Uint8Array");
  const { 0: protectedHeader, 1: encryptedKey, 2: iv, 3: ciphertext, 4: tag2, length } = jwe.split(".");
  if (length !== 5)
    throw new JWEInvalid("Invalid Compact JWE");
  return decryptJWE({
    ciphertext,
    iv: iv || void 0,
    protected: protectedHeader,
    tag: tag2 || void 0,
    encrypted_key: encryptedKey || void 0
  }, shared, key);
}

// node_modules/openid-client/build/index.js
var headers;
var USER_AGENT2;
if (typeof navigator === "undefined" || !navigator.userAgent?.startsWith?.("Mozilla/5.0 ")) {
  const NAME = "openid-client";
  const VERSION = "v6.9.0";
  USER_AGENT2 = `${NAME}/${VERSION}`;
  headers = { "user-agent": USER_AGENT2 };
}
var int = (config) => {
  return props.get(config);
};
var props;
function ClientSecretPost2(clientSecret) {
  if (clientSecret !== void 0) {
    return ClientSecretPost(clientSecret);
  }
  const cache2 = /* @__PURE__ */ new WeakMap();
  return (as, client, body, headers2) => {
    let auth;
    if (!(auth = cache2.get(client))) {
      assertString2(client.client_secret, '"metadata.client_secret"');
      auth = ClientSecretPost(client.client_secret);
      cache2.set(client, auth);
    }
    return auth(as, client, body, headers2);
  };
}
function assertString2(input, it) {
  if (typeof input !== "string") {
    throw CodedTypeError2(`${it} must be a string`, ERR_INVALID_ARG_TYPE2);
  }
  if (input.length === 0) {
    throw CodedTypeError2(`${it} must not be empty`, ERR_INVALID_ARG_VALUE2);
  }
}
function ClientSecretBasic2(clientSecret) {
  if (clientSecret !== void 0) {
    return ClientSecretBasic(clientSecret);
  }
  const cache2 = /* @__PURE__ */ new WeakMap();
  return (as, client, body, headers2) => {
    let auth;
    if (!(auth = cache2.get(client))) {
      assertString2(client.client_secret, '"metadata.client_secret"');
      auth = ClientSecretBasic(client.client_secret);
      cache2.set(client, auth);
    }
    return auth(as, client, body, headers2);
  };
}
function None2() {
  return None();
}
var customFetch2 = customFetch;
var ERR_INVALID_ARG_VALUE2 = "ERR_INVALID_ARG_VALUE";
var ERR_INVALID_ARG_TYPE2 = "ERR_INVALID_ARG_TYPE";
function CodedTypeError2(message2, code, cause) {
  const err = new TypeError(message2, { cause });
  Object.assign(err, { code });
  return err;
}
function calculatePKCECodeChallenge2(codeVerifier) {
  return calculatePKCECodeChallenge(codeVerifier);
}
function randomPKCECodeVerifier() {
  return generateRandomCodeVerifier();
}
function randomNonce() {
  return generateRandomNonce();
}
function randomState() {
  return generateRandomState();
}
var ClientError = class extends Error {
  code;
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    this.code = options?.code;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var decoder3 = new TextDecoder();
function e(msg, cause, code) {
  return new ClientError(msg, { cause, code });
}
function errorHandler(err) {
  if (err instanceof TypeError || err instanceof ClientError || err instanceof ResponseBodyError || err instanceof AuthorizationResponseError || err instanceof WWWAuthenticateChallengeError) {
    throw err;
  }
  if (err instanceof OperationProcessingError) {
    switch (err.code) {
      case HTTP_REQUEST_FORBIDDEN:
        throw e("only requests to HTTPS are allowed", err, err.code);
      case REQUEST_PROTOCOL_FORBIDDEN:
        throw e("only requests to HTTP or HTTPS are allowed", err, err.code);
      case RESPONSE_IS_NOT_CONFORM:
        throw e("unexpected HTTP response status code", err.cause, err.code);
      case RESPONSE_IS_NOT_JSON:
        throw e("unexpected response content-type", err.cause, err.code);
      case PARSE_ERROR:
        throw e("parsing error occured", err, err.code);
      case INVALID_RESPONSE:
        throw e("invalid response encountered", err, err.code);
      case JWT_CLAIM_COMPARISON:
        throw e("unexpected JWT claim value encountered", err, err.code);
      case JSON_ATTRIBUTE_COMPARISON:
        throw e("unexpected JSON attribute value encountered", err, err.code);
      case JWT_TIMESTAMP_CHECK:
        throw e("JWT timestamp claim value failed validation", err, err.code);
      default:
        throw e(err.message, err, err.code);
    }
  }
  if (err instanceof UnsupportedOperationError) {
    throw e("unsupported operation", err, err.code);
  }
  if (err instanceof DOMException) {
    switch (err.name) {
      case "OperationError":
        throw e("runtime operation error", err, UNSUPPORTED_OPERATION);
      case "NotSupportedError":
        throw e("runtime unsupported operation", err, UNSUPPORTED_OPERATION);
      case "TimeoutError":
        throw e("operation timed out", err, "OAUTH_TIMEOUT");
      case "AbortError":
        throw e("operation aborted", err, "OAUTH_ABORT");
    }
  }
  throw new ClientError("something went wrong", { cause: err });
}
function handleEntraId(server, as, options) {
  if (server.origin === "https://login.microsoftonline.com" && (!options?.algorithm || options.algorithm === "oidc")) {
    as[kEntraId] = true;
    return true;
  }
  return false;
}
function handleB2Clogin(server, options) {
  if (server.hostname.endsWith(".b2clogin.com") && (!options?.algorithm || options.algorithm === "oidc")) {
    return true;
  }
  return false;
}
async function discovery(server, clientId, metadata, clientAuthentication, options) {
  const as = await performDiscovery2(server, options);
  const instance = new Configuration(as, clientId, metadata, clientAuthentication);
  let internals = int(instance);
  if (options?.[customFetch2]) {
    internals.fetch = options[customFetch2];
  }
  if (options?.timeout !== void 0) {
    internals.timeout = options.timeout;
  }
  if (options?.execute) {
    for (const extension of options.execute) {
      extension(instance);
    }
  }
  return instance;
}
async function performDiscovery2(server, options) {
  if (!(server instanceof URL)) {
    throw CodedTypeError2('"server" must be an instance of URL', ERR_INVALID_ARG_TYPE2);
  }
  const resolve = !server.href.includes("/.well-known/");
  const timeout = options?.timeout ?? 30;
  const signal3 = AbortSignal.timeout(timeout * 1e3);
  const as = await (resolve ? discoveryRequest(server, {
    algorithm: options?.algorithm,
    [customFetch]: options?.[customFetch2],
    [allowInsecureRequests]: options?.execute?.includes(allowInsecureRequests2),
    signal: signal3,
    headers: new Headers(headers)
  }) : (options?.[customFetch2] || fetch)((() => {
    checkProtocol(server, options?.execute?.includes(allowInsecureRequests2) ? false : true);
    return server.href;
  })(), {
    headers: Object.fromEntries(new Headers({ accept: "application/json", ...headers }).entries()),
    body: void 0,
    method: "GET",
    redirect: "manual",
    signal: signal3
  })).then((response) => processDiscoveryResponse(_nodiscoverycheck, response)).catch(errorHandler);
  if (resolve && new URL(as.issuer).href !== server.href) {
    handleEntraId(server, as, options) || handleB2Clogin(server, options) || (() => {
      throw new ClientError("discovered metadata issuer does not match the expected issuer", {
        code: JSON_ATTRIBUTE_COMPARISON,
        cause: {
          expected: server.href,
          body: as,
          attribute: "issuer"
        }
      });
    })();
  }
  return as;
}
var decryptedResponses;
function setDecryptedResponse(result, signed) {
  if (signed !== void 0) {
    decryptedResponses ||= /* @__PURE__ */ new WeakMap();
    decryptedResponses.set(result, signed);
  }
  return result;
}
function captureDecryptedResponse(decrypt2) {
  let signed;
  return {
    decrypt: decrypt2 && (async (jwe) => signed = await decrypt2(jwe)),
    get: () => signed
  };
}
function getServerHelpers(metadata) {
  return {
    supportsPKCE: {
      __proto__: null,
      value(method = "S256") {
        return metadata.code_challenge_methods_supported?.includes(method) === true;
      }
    }
  };
}
function addServerHelpers(metadata) {
  Object.defineProperties(metadata, getServerHelpers(metadata));
}
var kEntraId = /* @__PURE__ */ Symbol();
var Configuration = class {
  constructor(server, clientId, metadata, clientAuthentication) {
    if (typeof clientId !== "string" || !clientId.length) {
      throw CodedTypeError2('"clientId" must be a non-empty string', ERR_INVALID_ARG_TYPE2);
    }
    if (typeof metadata === "string") {
      metadata = { client_secret: metadata };
    }
    if (metadata?.client_id !== void 0 && clientId !== metadata.client_id) {
      throw CodedTypeError2('"clientId" and "metadata.client_id" must be the same', ERR_INVALID_ARG_VALUE2);
    }
    const client = {
      ...structuredClone(metadata),
      client_id: clientId
    };
    client[clockSkew] = metadata?.[clockSkew] ?? 0;
    client[clockTolerance] = metadata?.[clockTolerance] ?? 30;
    let auth;
    if (clientAuthentication) {
      auth = clientAuthentication;
    } else {
      if (typeof client.client_secret === "string" && client.client_secret.length) {
        auth = ClientSecretPost2(client.client_secret);
      } else {
        auth = None2();
      }
    }
    let c = Object.freeze(client);
    const clone = structuredClone(server);
    if (kEntraId in server) {
      clone[_expectedIssuer] = ({ claims: { tid } }) => server.issuer.replace("{tenantid}", tid);
    }
    let as = Object.freeze(clone);
    props ||= /* @__PURE__ */ new WeakMap();
    props.set(this, {
      __proto__: null,
      as,
      c,
      auth,
      tlsOnly: true,
      timeout: 30,
      jwksCache: {}
    });
  }
  serverMetadata() {
    const metadata = structuredClone(int(this).as);
    addServerHelpers(metadata);
    return metadata;
  }
  clientMetadata() {
    const metadata = structuredClone(int(this).c);
    return metadata;
  }
  get timeout() {
    return int(this).timeout;
  }
  set timeout(value) {
    int(this).timeout = value;
  }
  get [customFetch2]() {
    return int(this).fetch;
  }
  set [customFetch2](value) {
    int(this).fetch = value;
  }
};
Object.freeze(Configuration.prototype);
function getHelpers(response) {
  let exp = void 0;
  if (response.expires_in !== void 0) {
    exp = Date.now() + response.expires_in * 1e3;
  }
  return {
    expiresIn: {
      __proto__: null,
      value() {
        if (exp) {
          const now = Date.now();
          if (exp > now) {
            return Math.floor((exp - now) / 1e3);
          }
          return 0;
        }
        return void 0;
      }
    },
    claims: {
      __proto__: null,
      value() {
        return getValidatedIdTokenClaims(response);
      }
    }
  };
}
function addHelpers(response) {
  Object.defineProperties(response, getHelpers(response));
}
function allowInsecureRequests2(config) {
  int(config).tlsOnly = false;
}
function stripParams(url) {
  url = new URL(url);
  url.search = "";
  url.hash = "";
  return url.href;
}
function webInstanceOf(input, toStringTag) {
  try {
    return Object.getPrototypeOf(input)[Symbol.toStringTag] === toStringTag;
  } catch {
    return false;
  }
}
async function authorizationCodeGrant(config, currentUrl, checks, tokenEndpointParameters, options) {
  checkConfig(config);
  if (options?.flag !== retry && !(currentUrl instanceof URL) && !webInstanceOf(currentUrl, "Request")) {
    throw CodedTypeError2('"currentUrl" must be an instance of URL, or Request', ERR_INVALID_ARG_TYPE2);
  }
  let authResponse;
  let redirectUri;
  const { as, c, auth, fetch: fetch2, tlsOnly, jarm, hybrid, nonRepudiation, timeout, decrypt: decrypt2, implicit } = int(config);
  if (options?.flag === retry) {
    authResponse = options.authResponse;
    redirectUri = options.redirectUri;
  } else {
    if (!(currentUrl instanceof URL)) {
      const request = currentUrl;
      currentUrl = new URL(currentUrl.url);
      switch (request.method) {
        case "GET":
          break;
        case "POST":
          const params = new URLSearchParams(await formPostResponse(request));
          if (hybrid) {
            currentUrl.hash = params.toString();
          } else {
            for (const [k, v] of params.entries()) {
              currentUrl.searchParams.append(k, v);
            }
          }
          break;
        default:
          throw CodedTypeError2("unexpected Request HTTP method", ERR_INVALID_ARG_VALUE2);
      }
    }
    redirectUri = stripParams(currentUrl);
    switch (true) {
      case !!jarm:
        authResponse = await jarm(currentUrl, checks?.expectedState);
        break;
      case !!hybrid:
        authResponse = await hybrid(currentUrl, checks?.expectedNonce, checks?.expectedState, checks?.maxAge);
        break;
      case !!implicit:
        throw new TypeError("authorizationCodeGrant() cannot be used by response_type=id_token clients");
      default:
        try {
          authResponse = validateAuthResponse(as, c, currentUrl.searchParams, checks?.expectedState);
        } catch (err) {
          errorHandler(err);
        }
    }
  }
  const response = await authorizationCodeGrantRequest(as, c, auth, authResponse, redirectUri, checks?.pkceCodeVerifier || nopkce, {
    additionalParameters: tokenEndpointParameters,
    [customFetch]: fetch2,
    [allowInsecureRequests]: !tlsOnly,
    DPoP: options?.DPoP,
    headers: new Headers(headers),
    signal: signal2(timeout)
  }).catch(errorHandler);
  if (typeof checks?.expectedNonce === "string" || typeof checks?.maxAge === "number") {
    checks.idTokenExpected = true;
  }
  const signed = captureDecryptedResponse(decrypt2);
  const p = processAuthorizationCodeResponse(as, c, response, {
    expectedNonce: checks?.expectedNonce,
    maxAge: checks?.maxAge,
    requireIdToken: checks?.idTokenExpected,
    [jweDecrypt]: signed.decrypt
  });
  let result;
  try {
    result = await p;
  } catch (err) {
    if (retryable(err, options)) {
      return authorizationCodeGrant(config, void 0, checks, tokenEndpointParameters, {
        ...options,
        flag: retry,
        authResponse,
        redirectUri
      });
    }
    errorHandler(err);
  }
  result.id_token && await nonRepudiation?.(response);
  addHelpers(result);
  const authorization = decryptedResponses?.get(authResponse);
  const tokenEndpoint = signed.get();
  let jwts;
  if (tokenEndpoint || authorization) {
    const authorizationEndpoint = authorization?.id_token?.authorization_endpoint;
    jwts = Object.freeze({
      ...authorization?.authorization_response && {
        authorization_response: authorization.authorization_response
      },
      ...(tokenEndpoint || authorizationEndpoint) && {
        id_token: Object.freeze({
          ...tokenEndpoint && { token_endpoint: tokenEndpoint },
          ...authorizationEndpoint && {
            authorization_endpoint: authorizationEndpoint
          }
        })
      }
    });
  }
  return setDecryptedResponse(result, jwts);
}
function buildAuthorizationUrl(config, parameters) {
  checkConfig(config);
  const { as, c, tlsOnly, hybrid, jarm, implicit } = int(config);
  const authorizationEndpoint = resolveEndpoint(as, "authorization_endpoint", false, tlsOnly);
  parameters = new URLSearchParams(parameters);
  if (!parameters.has("client_id")) {
    parameters.set("client_id", c.client_id);
  }
  if (!parameters.has("request_uri") && !parameters.has("request")) {
    if (!parameters.has("response_type")) {
      parameters.set("response_type", hybrid ? "code id_token" : implicit ? "id_token" : "code");
    }
    if (implicit && !parameters.has("nonce")) {
      throw CodedTypeError2("response_type=id_token clients must provide a nonce parameter in their authorization request parameters", ERR_INVALID_ARG_VALUE2);
    }
    if (jarm) {
      parameters.set("response_mode", "jwt");
    }
  }
  for (const [k, v] of parameters.entries()) {
    authorizationEndpoint.searchParams.append(k, v);
  }
  return authorizationEndpoint;
}
function buildEndSessionUrl(config, parameters) {
  checkConfig(config);
  const { as, c, tlsOnly } = int(config);
  const endSessionEndpoint = resolveEndpoint(as, "end_session_endpoint", false, tlsOnly);
  parameters = new URLSearchParams(parameters);
  if (!parameters.has("client_id")) {
    parameters.set("client_id", c.client_id);
  }
  for (const [k, v] of parameters.entries()) {
    endSessionEndpoint.searchParams.append(k, v);
  }
  return endSessionEndpoint;
}
function checkConfig(input) {
  if (!(input instanceof Configuration)) {
    throw CodedTypeError2('"config" must be an instance of Configuration', ERR_INVALID_ARG_TYPE2);
  }
  if (Object.getPrototypeOf(input) !== Configuration.prototype) {
    throw CodedTypeError2("subclassing Configuration is not allowed", ERR_INVALID_ARG_VALUE2);
  }
}
function signal2(timeout) {
  return timeout ? AbortSignal.timeout(timeout * 1e3) : void 0;
}
function retryable(err, options) {
  if (options?.DPoP && options.flag !== retry) {
    return isDPoPNonceError(err);
  }
  return false;
}
var retry = /* @__PURE__ */ Symbol();

// node_modules/jose/dist/webapi/lib/jwe_encrypt.js
function checkDisjoint(protectedHeader, unprotectedHeader, sharedUnprotectedHeader) {
  if (!isDisjoint(protectedHeader, unprotectedHeader, sharedUnprotectedHeader))
    throw new JWEInvalid("JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");
}
function checkEncryptHeaders(input, options, sharedHeadersNormalized = false) {
  if (!input[1] && !input[2] && !input[3])
    throw new JWEInvalid("either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()");
  options !== void 0 && (input[8] = options?.crit);
  let [, protectedHeader, unprotectedHeader, sharedUnprotectedHeader, aad, cek, iv, keyManagementParameters, crit] = input;
  if (aad !== void 0 && assertUint8Array(aad, "JWE Additional Authenticated Data"), cek !== void 0 && assertUint8Array(cek, "JWE Content Encryption Key"), iv !== void 0 && assertUint8Array(iv, "JWE Initialization Vector"), !sharedHeadersNormalized && protectedHeader !== void 0 && (protectedHeader = serializeJoseHeader(JWEInvalid, protectedHeader)[0], input[1] = protectedHeader), unprotectedHeader !== void 0 && (unprotectedHeader = serializeJoseHeader(JWEInvalid, unprotectedHeader)[0], input[2] = unprotectedHeader), !sharedHeadersNormalized && sharedUnprotectedHeader !== void 0 && (sharedUnprotectedHeader = serializeJoseHeader(JWEInvalid, sharedUnprotectedHeader)[0], input[3] = sharedUnprotectedHeader), keyManagementParameters !== void 0 && !isObject(keyManagementParameters))
    throw new TypeError("JWE Key Management Parameters must be an object");
  checkDisjoint(protectedHeader, unprotectedHeader, sharedUnprotectedHeader);
  const joseHeader = {
    ...protectedHeader,
    ...unprotectedHeader,
    ...sharedUnprotectedHeader
  };
  validateCritDuplicates(JWEInvalid, protectedHeader), validateCrit(JWEInvalid, JWE_RECOGNIZED, crit, protectedHeader, joseHeader), validateZip(joseHeader, protectedHeader);
  const { alg, enc } = joseHeader;
  if (typeof alg != "string" || !alg)
    throw new JWEInvalid('JWE "alg" (Algorithm) Header Parameter missing or invalid');
  const algEntry = JWE[alg];
  if (algEntry?.mode === "integrated-encryption") {
    if (enc !== void 0)
      throw new JWEInvalid('JWE "enc" (Encryption Algorithm) Header Parameter must not be present for integrated encryption');
    if (cek !== void 0)
      throw new TypeError(`setContentEncryptionKey cannot be called with JWE "alg" (Algorithm) Header ${alg}`);
    if (iv !== void 0)
      throw new TypeError(`setInitializationVector cannot be called with JWE "alg" (Algorithm) Header ${alg}`);
    return [joseHeader, void 0, algEntry];
  }
  if (typeof enc != "string" || !enc)
    throw new JWEInvalid('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
  return [joseHeader, jweEncryption(enc), algEntry];
}
async function encryptJWE(input, checked, key) {
  const [joseHeader, encEntry, selected] = checked, [inputPlaintext, inputProtectedHeader, inputUnprotectedHeader, sharedUnprotectedHeader, aad, providedCek, inputIv, keyManagementParameters, , unprotectedParameters] = input;
  let protectedHeader = inputProtectedHeader, unprotectedHeader = inputUnprotectedHeader;
  const algEntry = selected ?? jweAlgorithm(joseHeader.alg);
  let encryptedKey, parameters, cek;
  algEntry.mode === "integrated-encryption" ? cek = await prepareKey(algEntry, key, "encrypt") : [cek, encryptedKey, parameters] = await encryptKeyManagement(algEntry, encEntry, key, joseHeader, providedCek, keyManagementParameters), parameters && (unprotectedParameters ? unprotectedHeader = unprotectedHeader ? { ...unprotectedHeader, ...parameters } : parameters : protectedHeader = protectedHeader ? { ...protectedHeader, ...parameters } : parameters, checkDisjoint(protectedHeader, unprotectedHeader, sharedUnprotectedHeader));
  const encodedProtectedHeader = protectedHeader ? encode2(JSON.stringify(protectedHeader)) : "", encodedAad = aad?.byteLength ? encode2(aad) : void 0, additionalAuthenticatedData = encode(encodedAad ? `${encodedProtectedHeader}.${encodedAad}` : encodedProtectedHeader);
  let plaintext = inputPlaintext;
  joseHeader.zip === "DEF" && (plaintext = await compress(plaintext).catch((cause) => {
    throw new JWEInvalid("Failed to compress plaintext", { cause });
  }));
  let ciphertext, tag2, iv;
  algEntry.mode === "integrated-encryption" ? [encryptedKey, ciphertext] = await algEntry.encrypt(cek, plaintext, additionalAuthenticatedData, protectedHeader, joseHeader, keyManagementParameters) : { ciphertext, tag: tag2, iv } = await encrypt(encEntry, plaintext, cek, inputIv, additionalAuthenticatedData);
  const jwe = {
    ciphertext: encode2(ciphertext)
  };
  return iv && (jwe.iv = encode2(iv)), tag2 && (jwe.tag = encode2(tag2)), encryptedKey?.byteLength && (jwe.encrypted_key = encode2(encryptedKey)), encodedAad && (jwe.aad = encodedAad), protectedHeader && (jwe.protected = encodedProtectedHeader), sharedUnprotectedHeader && (jwe.unprotected = sharedUnprotectedHeader), unprotectedHeader && (jwe.header = unprotectedHeader), jwe;
}
async function createJWE(input, key, options) {
  return encryptJWE(input, checkEncryptHeaders(input, options), key);
}
function compactJWE(jwe) {
  return [jwe.protected, jwe.encrypted_key, jwe.iv, jwe.ciphertext, jwe.tag].join(".");
}

// node_modules/jose/dist/webapi/lib/jws_algorithms.js
var sig = [["verify"], ["sign"]];
function hmac(bits) {
  const subtle = { name: "HMAC", hash: `SHA-${bits}` };
  return { kty: ["oct"], secret: true, subtle, signing: subtle, usages: sig };
}
function rsa(bits, saltLength) {
  const subtle = { name: saltLength ? "RSA-PSS" : "RSASSA-PKCS1-v1_5", hash: `SHA-${bits}` };
  return {
    kty: ["RSA"],
    subtle,
    signing: saltLength ? { ...subtle, saltLength } : subtle,
    usages: sig,
    minRsaBits: 2048
  };
}
function ecdsa(crv, bits) {
  return {
    kty: ["EC"],
    crv,
    subtle: { name: "ECDSA", namedCurve: crv },
    signing: { name: "ECDSA", hash: `SHA-${bits}` },
    usages: sig
  };
}
function eddsa() {
  const subtle = { name: "Ed25519" };
  return {
    kty: ["OKP"],
    crv: "Ed25519",
    subtle,
    signing: subtle,
    usages: sig
  };
}
function mldsa(parameterSet) {
  const subtle = { name: `ML-DSA-${parameterSet}` };
  return {
    kty: ["AKP"],
    subtle,
    signing: subtle,
    usages: sig
  };
}
var JWS = table({
  HS256: hmac(256),
  HS384: hmac(384),
  HS512: hmac(512),
  RS256: rsa(256),
  RS384: rsa(384),
  RS512: rsa(512),
  PS256: rsa(256, 32),
  PS384: rsa(384, 48),
  PS512: rsa(512, 64),
  ES256: ecdsa("P-256", 256),
  ES384: ecdsa("P-384", 384),
  ES512: ecdsa("P-521", 512),
  EdDSA: eddsa(),
  Ed25519: eddsa(),
  "ML-DSA-44": mldsa(44),
  "ML-DSA-65": mldsa(65),
  "ML-DSA-87": mldsa(87)
});
function jwsAlgorithm(alg) {
  const entry = typeof alg == "string" ? JWS[alg] : void 0;
  if (!entry)
    throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  return entry;
}

// node_modules/jose/dist/webapi/lib/jws_verify.js
function prepareVerify(options) {
  return [options && validateAlgorithms("algorithms", options.algorithms), options?.crit];
}
function parseProtectedHeader(encodedProtectedHeader) {
  return encodedProtectedHeader === void 0 ? {} : parseJoseHeader(encodedProtectedHeader, JWSInvalid, "JWS Protected Header is invalid");
}
function encodeCompactUnencodedPayload(payload) {
  try {
    return encode(payload);
  } catch (cause) {
    throw new JWSInvalid("JWS Compact Serialization payload must use only ASCII characters", {
      cause
    });
  }
}
async function verifySignature(jws, shared, key, encodeUnencodedPayload, parsedProtected) {
  const { protected: encodedProtectedHeader, header, payload: inputPayload } = jws, protectedHeader = parsedProtected ?? parseProtectedHeader(encodedProtectedHeader);
  if (!isDisjoint(protectedHeader, header))
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  const joseHeader = { ...protectedHeader, ...header }, b64 = validateB64(protectedHeader, validateCrit(JWSInvalid, JWS_RECOGNIZED, shared[1], protectedHeader, joseHeader)), { alg } = joseHeader;
  if (typeof alg != "string" || !alg)
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  if (shared[0] && !shared[0].has(alg))
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  if (b64) {
    if (typeof inputPayload != "string")
      throw new JWSInvalid("JWS Payload must be a string");
  } else if (typeof inputPayload != "string" && !(inputPayload instanceof Uint8Array))
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  const signingPayload = b64 || typeof inputPayload != "string" ? inputPayload : encodeUnencodedPayload(inputPayload);
  let resolvedKey = false;
  typeof key == "function" && (key = await key(protectedHeader, jws), resolvedKey = true);
  const entry = jwsAlgorithm(alg), signingInput = concat(encodedProtectedHeader !== void 0 ? encode(encodedProtectedHeader) : new Uint8Array(), encode("."), typeof signingPayload == "string" ? shared[2] ??= encodeAsciiMember(signingPayload, "payload", JWSInvalid) : signingPayload), signature = decodeBase64url(jws.signature, "signature", JWSInvalid), verificationKey = await prepareKey(entry, key, "verify"), cryptoKey = await rawKey(verificationKey, entry.subtle, "verify");
  entry.minRsaBits && checkModulusLength(entry.alg, cryptoKey);
  let verified = false;
  try {
    verified = await crypto.subtle.verify(entry.signing, cryptoKey, signature, signingInput);
  } catch (cause) {
    throw new JWSSignatureVerificationFailed(void 0, { cause });
  }
  if (!verified)
    throw new JWSSignatureVerificationFailed();
  const result = { payload: typeof signingPayload == "string" ? decodeBase64url(signingPayload, "payload", JWSInvalid) : signingPayload };
  return encodedProtectedHeader !== void 0 && (result.protectedHeader = protectedHeader), header !== void 0 && (result.unprotectedHeader = header), resolvedKey ? [{ ...result, key: verificationKey }, b64] : [result, b64];
}
async function verifyCompact(jws, shared, key) {
  if (jws instanceof Uint8Array && (jws = decoder2.decode(jws)), typeof jws != "string")
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3)
    throw new JWSInvalid("Invalid Compact JWS");
  return verifySignature({ payload, protected: protectedHeader, signature }, shared, key, encodeCompactUnencodedPayload);
}

// node_modules/jose/dist/webapi/lib/jwt_claims_set.js
var epoch = (date) => Math.floor(date.getTime() / 1e3);
var multipliers = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
  y: 31557600
};
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var checkFailed = "check_failed";
function invalidDuration() {
  throw new TypeError("Invalid time period format");
}
function secs(str) {
  typeof str != "string" && invalidDuration();
  const matched = REGEX.exec(str);
  (!matched || matched[4] && matched[1]) && invalidDuration();
  const value = parseFloat(matched[2]), durationSeconds = Math.round(value * multipliers[matched[3][0].toLowerCase()]);
  return Number.isFinite(durationSeconds) || invalidDuration(), matched[1] === "-" || matched[4] === "ago" ? -durationSeconds : durationSeconds;
}
function validateInput(label, input) {
  if (!Number.isFinite(input))
    throw new TypeError(`Invalid ${label} input`);
  return input;
}
function validateStringClaim2(claim, value) {
  if (typeof value != "string")
    throw new TypeError(`"${claim}" claim must be a string`);
}
function validateAudienceClaim(value) {
  if (typeof value != "string" && (!Array.isArray(value) || Array.from(value).some((member) => typeof member != "string")))
    throw new TypeError('"aud" claim must be a string or an array of strings');
}
function numericDate(value, label) {
  return typeof value == "number" ? validateInput(label, value) : value instanceof Date ? validateInput(label, epoch(value)) : epoch(/* @__PURE__ */ new Date()) + secs(value);
}
var normalizeTyp = (value) => {
  const normalized = value.toLowerCase();
  return value.includes("/") ? normalized : `application/${normalized}`;
};
var checkAudiencePresence = (audPayload, audOption) => typeof audPayload == "string" ? audOption.includes(audPayload) : Array.isArray(audPayload) ? audOption.some((aud) => audPayload.includes(aud)) : false;
function validateNumericDate(claimsSet, claim, required = false) {
  const value = claimsSet[claim];
  if (!(value === void 0 && !required)) {
    if (typeof value != "number")
      throw new JWTClaimValidationFailed(`"${claim}" claim must be a number`, claimsSet, claim, "invalid");
    return value;
  }
}
function unexpectedClaim(claimsSet, claim) {
  throw new JWTClaimValidationFailed(`unexpected "${claim}" claim value`, claimsSet, claim, checkFailed);
}
function validateClaimsSet(protectedHeader, claimsSetBytes, options = {}) {
  let claimsSet;
  try {
    claimsSet = JSON.parse(strictDecoder.decode(claimsSetBytes));
  } catch (cause) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object", { cause });
  }
  if (!isObject(claimsSet))
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  const { typ } = options;
  if (typ !== void 0 && (typeof protectedHeader.typ != "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ)))
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', claimsSet, "typ", checkFailed);
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options, presenceCheck = [...requiredClaims];
  maxTokenAge !== void 0 && presenceCheck.push("iat"), audience !== void 0 && presenceCheck.push("aud"), subject !== void 0 && presenceCheck.push("sub"), issuer !== void 0 && presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse()))
    if (!Object.hasOwn(claimsSet, claim))
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, claimsSet, claim, "missing");
  issuer !== void 0 && !(Array.isArray(issuer) ? issuer : [issuer]).includes(claimsSet.iss) && unexpectedClaim(claimsSet, "iss"), subject !== void 0 && claimsSet.sub !== subject && unexpectedClaim(claimsSet, "sub"), audience !== void 0 && !checkAudiencePresence(claimsSet.aud, typeof audience == "string" ? [audience] : audience) && unexpectedClaim(claimsSet, "aud");
  const { clockTolerance: clockTolerance2 } = options;
  let tolerance = 0;
  if (typeof clockTolerance2 == "string")
    tolerance = secs(clockTolerance2);
  else if (clockTolerance2 !== void 0) {
    if (typeof clockTolerance2 != "number")
      throw new TypeError("Invalid clockTolerance option type");
    tolerance = clockTolerance2;
  }
  if (validateInput("clockTolerance option", tolerance), tolerance < 0)
    throw new TypeError("Invalid clockTolerance option input");
  const { currentDate } = options, now = validateInput("currentDate option", epoch(currentDate === void 0 ? /* @__PURE__ */ new Date() : currentDate)), iat = validateNumericDate(claimsSet, "iat", maxTokenAge !== void 0), nbf = validateNumericDate(claimsSet, "nbf");
  if (nbf !== void 0 && nbf > now + tolerance)
    throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', claimsSet, "nbf", checkFailed);
  const exp = validateNumericDate(claimsSet, "exp");
  if (exp !== void 0 && exp <= now - tolerance)
    throw new JWTExpired('"exp" claim timestamp check failed', claimsSet, "exp", checkFailed);
  if (maxTokenAge !== void 0) {
    const age = now - iat, max = validateInput("maxTokenAge option", typeof maxTokenAge == "number" ? maxTokenAge : secs(maxTokenAge));
    if (max < 0)
      throw new TypeError("Invalid maxTokenAge option input");
    if (age - tolerance > max)
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', claimsSet, "iat", checkFailed);
    if (age < -tolerance)
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', claimsSet, "iat", checkFailed);
  }
  return claimsSet;
}
var producerClaimsSets;
function producerClaimsSet(producer) {
  return producerClaimsSets.get(producer);
}
function jwtClaimsSetBytes(producer) {
  const claimsSet = producerClaimsSet(producer);
  for (const claim of ["iat", "nbf", "exp"]) {
    const value = claimsSet[claim];
    if (typeof value == "number" && !Number.isFinite(value))
      throw new TypeError(`"${claim}" claim must be a finite number`);
  }
  return encoder2.encode(JSON.stringify(claimsSet));
}
function jwtClaim(producer, claim) {
  return producerClaimsSet(producer)[claim];
}
var JWTClaimsBuilder = class {
  constructor(claimsSet = {}) {
    if (!isObject(claimsSet))
      throw new TypeError("JWT Claims Set MUST be an object");
    (producerClaimsSets ||= /* @__PURE__ */ new WeakMap()).set(this, structuredClone(claimsSet));
  }
  setIssuer(value) {
    return validateStringClaim2("iss", value), producerClaimsSet(this).iss = value, this;
  }
  setSubject(value) {
    return validateStringClaim2("sub", value), producerClaimsSet(this).sub = value, this;
  }
  setAudience(value) {
    return validateAudienceClaim(value), producerClaimsSet(this).aud = value, this;
  }
  setJti(value) {
    return validateStringClaim2("jti", value), producerClaimsSet(this).jti = value, this;
  }
  setNotBefore(value) {
    return producerClaimsSet(this).nbf = numericDate(value, "setNotBefore"), this;
  }
  setExpirationTime(value) {
    return producerClaimsSet(this).exp = numericDate(value, "setExpirationTime"), this;
  }
  setIssuedAt(value) {
    const claimsSet = producerClaimsSet(this);
    return value === void 0 ? claimsSet.iat = epoch(/* @__PURE__ */ new Date()) : typeof value == "string" ? claimsSet.iat = validateInput("setIssuedAt", epoch(/* @__PURE__ */ new Date()) + secs(value)) : claimsSet.iat = numericDate(value, "setIssuedAt"), this;
  }
};

// node_modules/jose/dist/webapi/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const [verified, b64] = await verifyCompact(jwt, prepareVerify(options), key);
  if (!b64)
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  const payload = validateClaimsSet(verified.protectedHeader, verified.payload, options);
  return { ...verified, payload };
}

// node_modules/jose/dist/webapi/jwt/decrypt.js
async function jwtDecrypt(jwt, key, options) {
  const { plaintext, ...result } = await decryptCompact(jwt, prepareDecrypt(options), key), { protectedHeader } = result, payload = validateClaimsSet(protectedHeader, plaintext, options);
  for (const claim of ["iss", "sub", "aud"])
    if (protectedHeader[claim] !== void 0 && (claim === "aud" ? JSON.stringify(protectedHeader.aud) !== JSON.stringify(payload.aud) : protectedHeader[claim] !== payload[claim]))
      throw new JWTClaimValidationFailed(`replicated "${claim}" claim header parameter mismatch`, payload, claim, "mismatch");
  return { payload, ...result };
}

// node_modules/jose/dist/webapi/jwt/encrypt.js
var EncryptJWT_base = JWTClaimsBuilder;
var EncryptJWT = class extends EncryptJWT_base {
  #input = [void 0];
  #replicateIssuerAsHeader;
  #replicateSubjectAsHeader;
  #replicateAudienceAsHeader;
  setProtectedHeader(protectedHeader) {
    return assertNotSet(this.#input[1], "setProtectedHeader"), this.#input[1] = protectedHeader, this;
  }
  setKeyManagementParameters(parameters) {
    return assertNotSet(this.#input[7], "setKeyManagementParameters"), this.#input[7] = parameters, this;
  }
  setContentEncryptionKey(cek) {
    return assertNotSet(this.#input[5], "setContentEncryptionKey"), this.#input[5] = cek, this;
  }
  setInitializationVector(iv) {
    return assertNotSet(this.#input[6], "setInitializationVector"), this.#input[6] = iv, this;
  }
  replicateIssuerAsHeader() {
    return this.#replicateIssuerAsHeader = true, this;
  }
  replicateSubjectAsHeader() {
    return this.#replicateSubjectAsHeader = true, this;
  }
  replicateAudienceAsHeader() {
    return this.#replicateAudienceAsHeader = true, this;
  }
  async encrypt(key, options) {
    const plaintext = jwtClaimsSetBytes(this);
    this.#input[1] && (this.#replicateIssuerAsHeader || this.#replicateSubjectAsHeader || this.#replicateAudienceAsHeader) && (this.#input[1] = {
      ...this.#input[1],
      iss: this.#replicateIssuerAsHeader ? jwtClaim(this, "iss") : void 0,
      sub: this.#replicateSubjectAsHeader ? jwtClaim(this, "sub") : void 0,
      aud: this.#replicateAudienceAsHeader ? jwtClaim(this, "aud") : void 0
    });
    const input = [...this.#input];
    return input[0] = plaintext, compactJWE(await createJWE(input, key, options));
  }
};

// node_modules/jose/dist/webapi/jwks/local.js
function isUsableJWK(jwk, entry, alg, kid) {
  const { kty, key_ops: keyOps, ext, kid: jwkKid, alg: jwkAlg, use, crv } = jwk;
  return (ext === void 0 || typeof ext == "boolean") && (keyOps === void 0 || Array.isArray(keyOps) && keyOps.every((operation, index) => typeof operation == "string" && keyOps.indexOf(operation) === index) && keyOps.includes("verify")) && entry.kty.includes(kty) && (kid === void 0 || typeof kid == "string" && kid === jwkKid) && (jwkAlg === void 0 ? kty !== "AKP" : alg === jwkAlg) && (use === void 0 || use === "sig") && (!entry.crv || crv === entry.crv);
}
async function importWithAlgCache(cache2, jwk, entry) {
  const cached = cache2.get(jwk) || cache2.set(jwk, {}).get(jwk), { alg } = entry;
  if (cached[alg] === void 0) {
    const pending = jwkToKey(entry, jwk, true).then((key) => {
      if (key.type !== "public")
        throw new JWKSInvalid("JSON Web Key Set members must be public keys");
      return cached[alg] = key, key;
    }).catch((error) => {
      throw cached[alg] === pending && delete cached[alg], error;
    });
    cached[alg] = pending;
  }
  return cached[alg];
}
function createLocalJWKSet(jwks) {
  let snapshot;
  try {
    snapshot = structuredClone(jwks);
  } catch (cause) {
    throw new JWKSInvalid("JSON Web Key Set malformed", { cause });
  }
  if (!isJwkSet(snapshot))
    throw new JWKSInvalid("JSON Web Key Set malformed");
  const metadata = snapshot.keys.map((jwk) => {
    const normalized = snapshotJwk(jwk);
    return Array.isArray(normalized.key_ops) && (normalized.key_ops = [...normalized.key_ops]), normalized;
  }), cached = /* @__PURE__ */ new WeakMap();
  return Object.defineProperty(async (protectedHeader, token) => {
    const { alg, kid } = { ...protectedHeader, ...token?.header }, entry = typeof alg == "string" ? JWS[alg] : void 0;
    if (!entry || entry.secret)
      throw new JOSENotSupported('Unsupported "alg" value for a JSON Web Key Set');
    const candidates = snapshot.keys.filter((_, index) => isUsableJWK(metadata[index], entry, alg, kid)), { 0: jwk, length } = candidates;
    if (!length)
      throw new JWKSNoMatchingKey();
    if (length !== 1) {
      const error = new JWKSMultipleMatchingKeys();
      throw error[Symbol.asyncIterator] = async function* () {
        for (const jwk2 of candidates)
          try {
            yield await importWithAlgCache(cached, jwk2, entry);
          } catch {
          }
      }, error;
    }
    return importWithAlgCache(cached, jwk, entry);
  }, "jwks", {
    value: () => structuredClone(snapshot)
  });
}

// node_modules/jose/dist/webapi/jwks/remote.js
function isCloudflareWorkers() {
  return typeof WebSocketPair < "u" || typeof navigator < "u" && navigator.userAgent === "Cloudflare-Workers" || typeof EdgeRuntime < "u" && EdgeRuntime === "vercel";
}
var USER_AGENT3;
(typeof navigator > "u" || !navigator.userAgent?.startsWith?.("Mozilla/5.0 ")) && (USER_AGENT3 = "jose/v6.2.17");
var customFetch3 = /* @__PURE__ */ Symbol();
async function fetchJwks(url, headers2, signal3, fetchImpl = fetch) {
  const response = await fetchImpl(url, {
    method: "GET",
    signal: signal3,
    redirect: "manual",
    headers: headers2
  }).catch((err) => {
    throw err.name === "TimeoutError" ? new JWKSTimeout(void 0, { cause: err }) : err;
  });
  if (response.status !== 200)
    throw new JOSEError("Expected 200 OK from the JSON Web Key Set HTTP response");
  try {
    return await response.json();
  } catch (cause) {
    throw new JOSEError("Failed to parse the JSON Web Key Set HTTP response as JSON", { cause });
  }
}
var jwksCache2 = /* @__PURE__ */ Symbol();
function isFreshFor(timestamp, duration) {
  return Number.isFinite(timestamp) && Date.now() < timestamp + duration;
}
function validateDuration(value, fallback, option) {
  if (Number.isNaN(value))
    throw new TypeError(`"${option}" option must not be NaN`);
  if (typeof value == "number" && value < 0)
    throw new TypeError(`"${option}" option must not be negative`);
  return typeof value == "number" ? value : fallback;
}
function createRemoteJWKSet(url, options) {
  if (!(url instanceof URL))
    throw new TypeError("url must be an instance of URL");
  const href = new URL(url.href).href, opts = options ?? {}, timeoutOption = opts.timeoutDuration;
  if (typeof timeoutOption == "number" && (!Number.isInteger(timeoutOption) || timeoutOption < 0))
    throw new TypeError('"timeoutDuration" option must be a non-negative integer');
  const timeoutDuration = typeof timeoutOption == "number" ? timeoutOption : 5e3, cooldownDuration = validateDuration(opts.cooldownDuration, 3e4, "cooldownDuration"), cacheMaxAge = validateDuration(opts.cacheMaxAge, 6e5, "cacheMaxAge"), headers2 = new Headers(opts.headers);
  USER_AGENT3 && !headers2.has("User-Agent") && headers2.set("User-Agent", USER_AGENT3), headers2.has("accept") || headers2.set("accept", "application/json, application/jwk-set+json");
  const fetchImpl = opts[customFetch3], cache2 = opts[jwksCache2];
  let jwksTimestamp, pendingFetch, reloadSequence = 0, appliedSequence = 0, local;
  if (cache2 && typeof cache2 == "object") {
    const { uat, jwks } = cache2;
    isFreshFor(uat, cacheMaxAge) && isJwkSet(jwks) && (jwksTimestamp = uat, local = createLocalJWKSet(jwks));
  }
  const reload = async () => {
    if (pendingFetch && isCloudflareWorkers() && (pendingFetch = void 0), !pendingFetch) {
      const sequence = ++reloadSequence, current = pendingFetch = fetchJwks(href, headers2, AbortSignal.timeout(timeoutDuration), fetchImpl).then((json) => {
        const next = createLocalJWKSet(json);
        if (sequence <= appliedSequence)
          return;
        local = next;
        const updatedAt = Date.now();
        cache2 && (cache2.uat = updatedAt, cache2.jwks = json), jwksTimestamp = updatedAt, appliedSequence = sequence;
      }).finally(() => {
        pendingFetch === current && (pendingFetch = void 0);
      });
    }
    await pendingFetch;
  };
  return Object.defineProperties(async (protectedHeader, token) => {
    (!local || !isFreshFor(jwksTimestamp, cacheMaxAge)) && await reload();
    try {
      return await local(protectedHeader, token);
    } catch (err) {
      if (err instanceof JWKSNoMatchingKey && !isFreshFor(jwksTimestamp, cooldownDuration))
        return await reload(), local(protectedHeader, token);
      throw err;
    }
  }, {
    coolingDown: {
      get: () => isFreshFor(jwksTimestamp, cooldownDuration),
      enumerable: true
    },
    fresh: {
      get: () => isFreshFor(jwksTimestamp, cacheMaxAge),
      enumerable: true
    },
    reload: {
      value: reload,
      enumerable: true
    },
    reloading: {
      get: () => !!pendingFetch,
      enumerable: true
    },
    jwks: {
      value: () => local?.jwks(),
      enumerable: true
    }
  });
}

// src/comum/tipos.ts
var CAMINHOS = {
  base: "/api/portao",
  entrar: "/api/portao/entrar",
  callback: "/api/portao/callback",
  sair: "/api/portao/sair",
  backchannelLogout: "/api/portao/backchannel-logout",
  eu: "/api/portao/eu"
};
var RETORNO = {
  semAcesso: "sem-acesso",
  erro: "erro"
};
function ehPapel(valor) {
  return valor === "CAT" || valor === "BEAR";
}

// src/express/cookies.ts
function lerCookie(cabecalho, nome) {
  if (!cabecalho) return void 0;
  for (const parte of cabecalho.split(";")) {
    const i = parte.indexOf("=");
    if (i === -1) continue;
    if (parte.slice(0, i).trim() === nome) {
      try {
        return decodeURIComponent(parte.slice(i + 1).trim());
      } catch {
        return void 0;
      }
    }
  }
  return void 0;
}
function opcoes({ maxAgeMs, path, secure }) {
  return { httpOnly: true, sameSite: "lax", secure, path, maxAge: maxAgeMs };
}

// src/express/transacao.ts
var import_node_crypto = require("crypto");
var VALIDADE_TRANSACAO_MS = 10 * 60 * 1e3;
function chave(segredo) {
  return new Uint8Array((0, import_node_crypto.createHash)("sha256").update(`gatur-portao-client:transacao:${segredo}`).digest());
}
async function cifrarTransacao(t, segredo) {
  return new EncryptJWT({ ...t }).setProtectedHeader({ alg: "dir", enc: "A256GCM" }).setIssuedAt().setExpirationTime(`${VALIDADE_TRANSACAO_MS / 1e3}s`).encrypt(chave(segredo));
}
async function decifrarTransacao(valor, segredo) {
  if (!valor) return null;
  try {
    const { payload } = await jwtDecrypt(valor, chave(segredo));
    const { state, nonce, codeVerifier, voltar } = payload;
    if (typeof state !== "string" || typeof nonce !== "string" || typeof codeVerifier !== "string" || typeof voltar !== "string") {
      return null;
    }
    return { state, nonce, codeVerifier, voltar };
  } catch {
    return null;
  }
}

// src/express/portao.ts
var EVENTO_BACKCHANNEL = "http://schemas.openid.net/event/backchannel-logout";
function voltarSeguro(valor) {
  if (typeof valor !== "string" || !valor.startsWith("/") || valor.startsWith("//") || valor.startsWith("/\\")) {
    return "/";
  }
  if (valor.startsWith(CAMINHOS.base)) return "/";
  return valor;
}
function hash(token) {
  return (0, import_node_crypto2.createHash)("sha256").update(token).digest("hex");
}
function texto(valor) {
  return typeof valor === "string" && valor.length > 0 ? valor : null;
}
function assincrono(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
function querNavegacao(req) {
  return req.method === "GET" && Boolean(req.accepts(["html", "json"]) === "html");
}
function criarPortao(op) {
  const producao = op.producao ?? process.env.NODE_ENV === "production";
  const janelaMs = (op.janelaHoras ?? 12) * 60 * 60 * 1e3;
  const nomeCookie = op.nomeCookie ?? `${op.app}.sessao`;
  const nomeTransacao = `${op.app}.login`;
  const urlDoApp = new URL(op.urlDoApp).origin;
  const log = op.log ?? ((nivel, msg) => console[nivel](`[portao:${op.app}] ${msg}`));
  if (op.modoDev && producao) {
    throw new Error("gatur-portao-client: modoDev (PORTAO_DEV) n\xE3o pode ser ligado em produ\xE7\xE3o");
  }
  if (!op.segredo || op.segredo.length < 32) {
    throw new Error("gatur-portao-client: `segredo` precisa de pelo menos 32 caracteres");
  }
  if (producao && (!urlDoApp.startsWith("https://") || !op.issuer.startsWith("https://"))) {
    throw new Error("gatur-portao-client: em produ\xE7\xE3o, urlDoApp e issuer precisam ser https");
  }
  let configuracao = null;
  let jwks = null;
  function obterConfiguracao() {
    if (!configuracao) {
      const inseguro = new URL(op.issuer).protocol === "http:";
      configuracao = discovery(
        new URL(op.issuer),
        op.clientId,
        void 0,
        ClientSecretBasic2(op.clientSecret),
        inseguro && !producao ? { execute: [allowInsecureRequests2] } : void 0
      ).catch((erro) => {
        configuracao = null;
        throw erro;
      });
    }
    return configuracao;
  }
  async function obterJwks() {
    if (!jwks) {
      const jwksUri = (await obterConfiguracao()).serverMetadata().jwks_uri;
      if (!jwksUri) throw new Error("Port\xE3o sem jwks_uri no discovery");
      jwks = createRemoteJWKSet(new URL(jwksUri));
    }
    return jwks;
  }
  const cookieSessao = (maxAgeMs) => opcoes({ maxAgeMs, path: "/", secure: producao });
  const cookieTransacao = (maxAgeMs) => opcoes({ maxAgeMs, path: CAMINHOS.base, secure: producao });
  async function sessaoDaRequisicao(req) {
    const token = lerCookie(req.headers.cookie, nomeCookie);
    if (!token) return null;
    const sessao = await op.armazenamento.buscar(hash(token));
    if (!sessao) return null;
    if (sessao.expiraEm.getTime() <= Date.now()) {
      await op.armazenamento.apagar(sessao.id);
      return null;
    }
    return sessao;
  }
  function usuarioDev(req) {
    if (!op.modoDev) return null;
    const papel = req.get("x-dev-papel");
    if (!ehPapel(papel)) return null;
    const ehGato = papel === "CAT";
    return {
      id: `dev-${papel.toLowerCase()}`,
      papel,
      username: ehGato ? "gato" : "urso",
      nome: ehGato ? "Gato (dev)" : "Urso (dev)",
      apelido: null,
      cor: null
    };
  }
  const lerSessao = assincrono(async (req, _res, next) => {
    const dev = usuarioDev(req);
    if (dev) {
      req.usuario = dev;
    } else {
      const sessao = await sessaoDaRequisicao(req);
      if (sessao) req.usuario = sessao.usuario;
    }
    next();
  });
  const exigirLogin = assincrono(async (req, res, next) => {
    if (!req.usuario) {
      const dev = usuarioDev(req);
      const sessao = dev ? null : await sessaoDaRequisicao(req);
      req.usuario = dev ?? sessao?.usuario;
    }
    if (req.usuario) return next();
    if (querNavegacao(req)) {
      res.redirect(`${CAMINHOS.entrar}?voltar=${encodeURIComponent(voltarSeguro(req.originalUrl))}`);
      return;
    }
    res.status(401).json({ erro: { codigo: "NAO_AUTENTICADO", mensagem: "Entre pelo Port\xE3o para continuar." } });
  });
  const router = (0, import_express.Router)();
  router.get(
    CAMINHOS.entrar,
    assincrono(async (req, res) => {
      const config = await obterConfiguracao();
      const codeVerifier = randomPKCECodeVerifier();
      const state = randomState();
      const nonce = randomNonce();
      const voltar = voltarSeguro(req.query.voltar);
      res.cookie(
        nomeTransacao,
        await cifrarTransacao({ state, nonce, codeVerifier, voltar }, op.segredo),
        cookieTransacao(VALIDADE_TRANSACAO_MS)
      );
      const url = buildAuthorizationUrl(config, {
        redirect_uri: `${urlDoApp}${CAMINHOS.callback}`,
        scope: "openid profile",
        code_challenge: await calculatePKCECodeChallenge2(codeVerifier),
        code_challenge_method: "S256",
        state,
        nonce
      });
      res.redirect(url.href);
    })
  );
  router.get(
    CAMINHOS.callback,
    assincrono(async (req, res) => {
      const transacao = await decifrarTransacao(lerCookie(req.headers.cookie, nomeTransacao), op.segredo);
      res.clearCookie(nomeTransacao, cookieTransacao(0));
      if (req.query.error === "access_denied") {
        log("info", "login recusado pelo Port\xE3o (papel sem acesso)");
        res.redirect(`/?portao=${RETORNO.semAcesso}`);
        return;
      }
      if (!transacao) {
        log("warn", "callback sem transa\xE7\xE3o v\xE1lida (cookie ausente ou vencido)");
        res.redirect(`/?portao=${RETORNO.erro}`);
        return;
      }
      const config = await obterConfiguracao();
      let tokens;
      try {
        tokens = await authorizationCodeGrant(config, new URL(req.originalUrl, urlDoApp), {
          pkceCodeVerifier: transacao.codeVerifier,
          expectedState: transacao.state,
          expectedNonce: transacao.nonce,
          idTokenExpected: true
        });
      } catch (erro) {
        const codigo = erro.error;
        log("warn", `troca do c\xF3digo falhou: ${typeof codigo === "string" ? codigo : erro.name}`);
        res.redirect(`/?portao=${codigo === "access_denied" ? RETORNO.semAcesso : RETORNO.erro}`);
        return;
      }
      const claims = tokens.claims();
      const papel = claims?.papel;
      if (!claims || !tokens.id_token || !ehPapel(papel)) {
        log("error", "ID token sem claims esperadas (papel)");
        res.redirect(`/?portao=${RETORNO.erro}`);
        return;
      }
      const usuario = {
        id: claims.sub,
        papel,
        username: texto(claims.preferred_username),
        nome: texto(claims.name) ?? texto(claims.preferred_username) ?? papel,
        apelido: texto(claims.apelido),
        cor: texto(claims.cor)
      };
      const token = (0, import_node_crypto2.randomBytes)(32).toString("base64url");
      const agora = /* @__PURE__ */ new Date();
      await op.armazenamento.criar({
        id: hash(token),
        usuario,
        sid: texto(claims.sid),
        idToken: tokens.id_token,
        criadaEm: agora,
        expiraEm: new Date(agora.getTime() + janelaMs)
      });
      res.cookie(nomeCookie, token, cookieSessao(janelaMs));
      log("info", `login ok (papel ${usuario.papel})`);
      res.redirect(transacao.voltar);
    })
  );
  router.get(
    CAMINHOS.eu,
    assincrono(async (req, res) => {
      const dev = usuarioDev(req);
      if (dev) {
        res.json({ usuario: dev, expiraEm: null });
        return;
      }
      const sessao = await sessaoDaRequisicao(req);
      if (!sessao) {
        res.status(401).json({ erro: { codigo: "NAO_AUTENTICADO", mensagem: "Entre pelo Port\xE3o para continuar." } });
        return;
      }
      res.json({ usuario: sessao.usuario, expiraEm: sessao.expiraEm.toISOString() });
    })
  );
  router.post(
    CAMINHOS.sair,
    assincrono(async (req, res) => {
      const sessao = await sessaoDaRequisicao(req);
      res.clearCookie(nomeCookie, cookieSessao(0));
      if (!sessao) {
        res.json({ url: "/" });
        return;
      }
      await op.armazenamento.apagar(sessao.id);
      const config = await obterConfiguracao();
      const url = buildEndSessionUrl(config, {
        id_token_hint: sessao.idToken,
        post_logout_redirect_uri: `${urlDoApp}/`,
        client_id: op.clientId
      });
      res.json({ url: url.href });
    })
  );
  router.post(
    CAMINHOS.backchannelLogout,
    (0, import_express.urlencoded)({ extended: false, limit: "16kb" }),
    assincrono(async (req, res) => {
      const logoutToken = req.body?.logout_token;
      if (typeof logoutToken !== "string") {
        res.status(400).json({ error: "invalid_request" });
        return;
      }
      try {
        const config = await obterConfiguracao();
        const { payload } = await jwtVerify(logoutToken, await obterJwks(), {
          issuer: config.serverMetadata().issuer,
          audience: op.clientId,
          typ: "logout+jwt",
          maxTokenAge: "2m"
        });
        const eventos = payload.events;
        if (!eventos || typeof eventos[EVENTO_BACKCHANNEL] !== "object" || "nonce" in payload) {
          throw new Error("logout token sem o evento de back-channel");
        }
        const sid = texto(payload.sid);
        const sub = texto(payload.sub);
        if (!sid && !sub) throw new Error("logout token sem sid nem sub");
        const apagadas = sid ? await op.armazenamento.apagarPorSid(sid) : await op.armazenamento.apagarPorUsuario(sub);
        log("info", `back-channel logout: ${apagadas} sess\xE3o(\xF5es) encerrada(s)`);
        res.setHeader("Cache-Control", "no-store");
        res.status(200).end();
      } catch (erro) {
        log("warn", `back-channel logout recusado: ${erro.message}`);
        res.status(400).json({ error: "invalid_request" });
      }
    })
  );
  return { router, lerSessao, exigirLogin };
}
function exigirPapel(...papeis) {
  return (req, res, next) => {
    if (req.usuario && papeis.includes(req.usuario.papel)) return next();
    res.status(403).json({ erro: { codigo: "SEM_PERMISSAO", mensagem: "Seu perfil n\xE3o tem acesso a isto." } });
  };
}

// src/express/memoria.ts
function armazenamentoEmMemoriaSoParaTestes() {
  const sessoes = /* @__PURE__ */ new Map();
  const apagarSe = (cond) => {
    let n = 0;
    for (const [id, s] of sessoes) if (cond(s) && sessoes.delete(id)) n++;
    return n;
  };
  return {
    async criar(s) {
      sessoes.set(s.id, s);
    },
    async buscar(id) {
      return sessoes.get(id) ?? null;
    },
    async apagar(id) {
      sessoes.delete(id);
    },
    async apagarPorSid(sid) {
      return apagarSe((s) => s.sid === sid);
    },
    async apagarPorUsuario(usuarioId) {
      return apagarSe((s) => s.usuario.id === usuarioId);
    },
    tamanho: () => sessoes.size
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CAMINHOS,
  RETORNO,
  armazenamentoEmMemoriaSoParaTestes,
  criarPortao,
  ehPapel,
  exigirPapel
});
//# sourceMappingURL=index.cjs.map