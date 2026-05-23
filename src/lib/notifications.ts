// lib/notifications.ts
// Central helper — call this from any API route to create a notification.

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
) {
  await prisma.notification.create({ data: { userId, type, title, body } });
}
