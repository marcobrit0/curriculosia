import { protectedProcedure, publicProcedure } from "../context";
import { authService, type ProviderList, type UserDataExport } from "../services/auth";

export const authRouter = {
  providers: {
    list: publicProcedure
      .route({
        method: "GET",
        path: "/auth/providers",
        tags: ["Authentication"],
        operationId: "listAuthProviders",
        summary: "List authentication providers",
        description:
          "Returns a list of all authentication providers enabled on this Currículos IA instance, along with their display names. Possible providers include password-based credentials, Google, GitHub, and custom OAuth. No authentication required.",
        successDescription: "A map of enabled authentication provider identifiers to their display names.",
      })
      .handler((): ProviderList => {
        return authService.providers.list();
      }),
  },

  exportData: protectedProcedure
    .route({
      method: "GET",
      path: "/auth/export",
      tags: ["Authentication"],
      operationId: "exportAccountData",
      summary: "Export account data (LGPD portabilidade)",
      description:
        "Returns a JSON document containing the authenticated user's profile, resumes, subscriptions, and managed-AI usage history. Provided to satisfy the LGPD right to data portability (art. 18, V). Requires authentication.",
      successDescription: "JSON dump of the user's data.",
    })
    .handler(async ({ context }): Promise<UserDataExport> => {
      return await authService.exportData({ userId: context.user.id });
    }),

  deleteAccount: protectedProcedure
    .route({
      method: "DELETE",
      path: "/auth/account",
      tags: ["Authentication"],
      operationId: "deleteAccount",
      summary: "Delete user account",
      description:
        "Permanently deletes the authenticated user's account, including all resumes, uploaded files (profile pictures, screenshots, PDFs), and associated data. This action is irreversible. Requires authentication.",
      successDescription: "The user account and all associated data have been successfully deleted.",
    })
    .handler(async ({ context }): Promise<void> => {
      return await authService.deleteAccount({ userId: context.user.id });
    }),
};
