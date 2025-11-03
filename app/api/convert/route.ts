import { NextRequest, NextResponse } from "next/server";
import { ConversionType } from "../../../src/lib/types/conversion-types";
import { StringProvider } from "../../../src/lib/providers/string-provider";
import { JsonProvider } from "../../../src/lib/providers/json-provider";
import { XmlProvider } from "../../../src/lib/providers/xml-provider";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (
    body.toFormat === ConversionType.STRING ||
    body.fromFormat === ConversionType.STRING
  ) {
    const stringProvider = new StringProvider();

    const parsed = stringProvider.parse(body.document);

    return NextResponse.json({ data: parsed });
  }

  if (
    body.toFormat === ConversionType.JSON ||
    body.fromFormat === ConversionType.JSON
  ) {
    const stringProvider = new JsonProvider();

    const parsed = stringProvider.parse(body.document);

    return NextResponse.json({ data: parsed });
  }
  
  if (
    body.toFormat === ConversionType.XML ||
    body.fromFormat === ConversionType.XML
  ) {
    const stringProvider = new XmlProvider();

    const parsed = stringProvider.parse(body.document);

    return NextResponse.json({ data: parsed });
  }

  return NextResponse.json({ data: body, type: "Bryce" });
}
