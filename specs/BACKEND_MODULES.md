# Backend Modules & Frontend Type Sharing Blueprint

This specification document outlines the best practices and directory patterns for refactoring old backend routes into decoupled module services and sharing types directly with the frontend.

---

## 1. Directory Structure

For any category/module (e.g., `version`), organize the code as follows:

```text
backend/src/
├── types/
│   ├── response.ts                     # Reusable global schemas & type envelopes
│   └── index.ts                        # Types folder barrel export
├── modules/
│   └── <category>/                     # Module folder (e.g., version)
│       ├── index.ts                    # Module barrel export (exports all services and types)
│       └── services/                   # Business logic/Drizzle query services
│           ├── list-<category>.service.ts
│           ├── create-<category>.service.ts
│           └── ...
└── routes/
    └── <category>/                     # Fastify routes
        ├── list-<category>.ts          # Delegates logic to the corresponding service
        └── ...
```

---

## 2. Global Shared Schemas (`backend/src/types/response.ts`)

Common API structures (like pagination metadata and standard error/success envelopes) should be declared once in a global location:

```typescript
import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

// Standard base response envelope
export const BaseResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});
export type BaseResponse = Static<typeof BaseResponseSchema>;

// Standard error response envelope (for 4xx/5xx responses)
export const ErrorResponseSchema = Type.Object({
  success: Type.Boolean({ default: false }),
  message: Type.String(),
});
export type ErrorResponse = Static<typeof ErrorResponseSchema>;

// Standard pagination metadata
export const PaginationMetaSchema = Type.Object({
  total: Type.Number(),
  page: Type.Number(),
  limit: Type.Number(),
  totalPages: Type.Number(),
});
export type PaginationMeta = Static<typeof PaginationMetaSchema>;
```

---

## 3. Backend Module Services Pattern

Services must deal with pure TypeScript interfaces (`interface`/`type`) instead of Typebox schemas. This ensures frontend code (which runs in the browser) does not pull in Typebox validation logic.

### Guidelines:
1. **Pure Data Return:** Services should return clean TypeScript structures with Javascript types (e.g., mapping dates using `.toISOString()` to `string`).
2. **Fastify Decoupling:** Keep server-specific concerns (like `app.versionCache` or translations `request.t`) out of services. Trigger caches or translate keys inside the route handlers based on service outputs.
3. **Module Barrel Export:** Always create an `index.ts` barrel file inside `backend/src/modules/<category>/` to export all services and types:
   ```typescript
   export * from "./services/list-version.service.ts";
   export * from "./services/create-version.service.ts";
   // ...
   ```

---

## 4. Backend Routes Pattern

Backend routes use Fastify and Typebox schemas to validate runtime requests and responses. They call the services and map return values. 

### Guidelines:
1. **Extend Base Response:** Do not manually redeclare `success` and `message` properties on response schemas. Instead, extend them from `BaseResponseSchema` (imported from `backend/src/types/response.ts`) using `Type.Intersect`.
2. **Direct Schema Usage:** For simple responses that only return `success` and `message` (e.g., delete actions), reference `BaseResponseSchema` directly in the route `response` block and handler return type. Do not declare a redundant wrapper/alias constant.
3. **No 5xx Schemas:** Do not define `5xx` response schemas at the route level. All 5xx server-level errors are handled and formatted globally by the server's error handler.

```typescript
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { listVersionService } from "../../modules/version/services/list-version.service.ts";
import { BaseResponseSchema, ErrorResponseSchema, PaginationMetaSchema } from "../../types/response.ts";

// Route validation schemas...

const ListVersionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(VersionResponseItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

const listVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Version"],
      body: ListVersionBody,
      response: {
        200: ListVersionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof ListVersionBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof ListVersionResponse.static> {
      const result = await listVersionService(request.body);
      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.version.listSuccess),
        data: result,
      });
    },
  });
};
```

---

## 5. Frontend Type Sharing Pattern

In the frontend, import types directly from the backend via the `"backend/*"` path-alias. 

### Directory Organization:
Create a single `types.ts` file inside the frontend API module folder (e.g. `src/api/<module>/types.ts`) to manage type imports, extensions, and exports for that module.

### Compiler Configuration Requirement:
Since backend files resolve relative imports containing `.ts` extensions (e.g. `import { x } from "./y.ts"`), you **must** enable `"allowImportingTsExtensions": true` in the frontend `tsconfig.json` inside the `compilerOptions` section so that the frontend bundler can parse the backend TS files correctly without throwing extension-related errors.

### Critical Local Scope Requirement:
When types imported from the backend are referenced inside the frontend `types.ts` file itself (e.g. extending interfaces or as array types), you **must** import them into local scope first, and then export them. Do not use direct `export type { ... } from "backend/..."` exports.

### No Duplicate Response Envelopes:
Do not define redundant response wrappers like `CreateTierResponse` or `UpdateTierResponse` if they are structurally identical (e.g., just returning `success`, `message`, and `data`). Instead, declare a single generic response type (e.g. `TierResponse<T = TierItem>`) extending `BaseResponse` and reuse it for all handlers.

```typescript
// 1. Import locally to make them available in the scope of this file
import type {
  AppVersion,
  VersionSimpleItem,
  CreateVersionParams,
  UpdateVersionParams,
} from "backend/src/modules/version/index.ts";
import type { BaseResponse } from "backend/src/types/index.ts";

// 2. Export them for other frontend components to consume
export type {
  AppVersion,
  VersionSimpleItem,
  CreateVersionParams,
  UpdateVersionParams,
  BaseResponse,
};

// 3. Define a single generic response type instead of duplicates
export interface VersionResponse<T = AppVersion> extends BaseResponse {
  data: T;
}
```


---

## 6. Type-Safe Translation Keys (Locale Selectors)

To avoid typos and runtime missing key errors in localization, do not return raw `string` error keys from service layer. Instead, use a **Locale Selector Function** typed against `AppLocale` along with a numeric `statusCode` (e.g. `400` or `404`) to cleanly map the transport status code. These are grouped into a global `ServiceResponse` base interface to prevent duplication:

### Service Layer Implementation
1. Import `ServiceResponse` from `backend/src/types` and extend it:
   ```typescript
   import type { ServiceResponse } from "../../../types/index.ts";

   export interface CreateVersionResponse extends ServiceResponse {
     data?: AppVersion;
   }
   ```
2. Return the numeric status code and selector:
   ```typescript
   if (existingVersion) {
     return { success: false, statusCode: 400, errorKey: ($) => $.version.create.exists };
   }
   ```

Map the status code and translate the selector using Fastify Sensible's semantic helpers:
```typescript
if (!result.success || !result.data) {
  const message = request.t(result.errorKey!);
  if (result.statusCode === 404) {
    return reply.notFound(message);
  }
  return reply.badRequest(message);
}
```
This pattern provides semantic transport handling (using helper functions like `reply.notFound` and `reply.badRequest`) while maintaining full compile-time safety for localization keys.

---

## 7. Role-Based Route Authorization (Hooks)

To enforce authentication and restrict access by user roles, use the centralized `requireRoles` preHandler hook creator located in `backend/src/hooks/auth.hook.ts`.

### Guidelines:
1. **Never Duplicate Hook Logic:** Do not manually check sessions or user roles inside directory hooks. Always use `requireRoles`.
2. **Support Multiple Roles:** Pass an array of allowed roles from `EnumUserRole` (e.g. `[EnumUserRole.ADMIN]` or `[EnumUserRole.ADMIN, EnumUserRole.TEACHER]`).

### Example (`admin.hook.ts`):
```typescript
import type { FastifyInstance } from "fastify";
import { EnumUserRole } from "../../../db/schema/user/types.ts";
import { requireRoles } from "../../../hooks/auth.hook.ts";

async function adminHook(fastify: FastifyInstance) {
  fastify.decorateRequest("session");

  // Enforce that the user must have the ADMIN role
  fastify.addHook("preHandler", requireRoles(fastify, [EnumUserRole.ADMIN]));
}

export default adminHook;
```

---

## 8. Schema Design and Code Duplication Prevention (TypeBox Patterns)

To prevent code duplication when creating schemas for both `Create` and `Update` operations, follow these pattern guidelines:

### 1. Extract Base Fields
Define the core shared fields in a private plain JavaScript/TypeScript object. This avoids duplicating field definitions (such as strings, arrays, objects) across multiple schemas:

```typescript
const TierBaseFields = {
  name: Type.String({ minLength: 4 }),
  price: Type.String(),
  currency: Type.String(),
  billingCycle: Type.String(),
  features: Type.Array(Type.String()),
  limits: TierLimitsSchema,
  isActive: Type.Boolean(),
  sortOrder: Type.Number(),
  isPopular: Type.Boolean(),
};
```

### 2. Extend with TypeBox Helpers
Compose the final validation schemas using Typebox utilities (`Type.Object`, `Type.Partial`, etc.):
- **Create Schema:** Combines the shared base fields, adding any fields unique to creation (such as `slug`) or applying defaults:
  ```typescript
  export const CreateTierBody = Type.Object({
    slug: Type.String({ minLength: 4 }),
    name: TierBaseFields.name,
    price: TierBaseFields.price,
    currency: Type.String({ default: "USD" }),
    // ...other base fields with defaults
  });
  ```
- **Update Schema:** Makes the base fields optional using `Type.Partial`:
  ```typescript
  export const UpdateTierBody = Type.Partial(Type.Object(TierBaseFields));
  ```

### 3. Generate and Alias Static Types
Derive static TypeScript types from the composed schemas and export clean type aliases that match frontend expectations (such as `CreateTierParams` and `UpdateTierParams`):
```typescript
export type CreateTierBodyType = Static<typeof CreateTierBody>;
export type UpdateTierBodyType = Static<typeof UpdateTierBody>;

export type CreateTierParams = CreateTierBodyType;
export type UpdateTierParams = UpdateTierBodyType;
```
This ensures type safety on both sides while eliminating definition redundancies.




