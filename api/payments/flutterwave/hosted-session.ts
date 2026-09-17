import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  FlutterwaveRequestError,
  prepareFlutterwaveHostedSession,
} from "../../../server/routes/flutterwave.js";

export default async function hostedSessionHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const paymentSession = await prepareFlutterwaveHostedSession(
      req.body,
      typeof req.headers.authorization === "string" ? req.headers.authorization : undefined,
    );
    return res.status(200).json(paymentSession);
  } catch (error) {
    console.error("Flutterwave hosted session error", error);
    return res.status(error instanceof FlutterwaveRequestError ? error.status : 400).json({
      error: error instanceof Error ? error.message : "Unable to prepare payment",
    });
  }
}
