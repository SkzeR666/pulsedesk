import { NextResponse } from "next/server"
import { getAppBundle } from "@/lib/server/app-bundle"

export async function GET() {
  try {
    const bundle = await getAppBundle()
    return NextResponse.json(bundle)
  } catch (error) {
    console.error("bootstrap_error", error)

    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error)

    return NextResponse.json(
      {
        error: message || "Failed to load app data",
      },
      { status: 500 }
    )
  }
}
