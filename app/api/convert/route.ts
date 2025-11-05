import { NextRequest, NextResponse } from "next/server";
import { ConversionType } from "../../../src/lib/types/conversion-types";
import { StringProvider } from "../../../src/lib/providers/string-provider";
import { JsonProvider } from "../../../src/lib/providers/json-provider";
import { BaseProvider } from "../../../src/lib/providers/base-provider";
import { XmlProvider } from "../../../src/lib/providers/xml-provider";

const providerMap: Record<ConversionType, new () => BaseProvider> = {
  [ConversionType.STRING]: StringProvider,
  [ConversionType.JSON]: JsonProvider,
  [ConversionType.XML]: XmlProvider,
};

function getProvider(fromFormat: ConversionType): BaseProvider | undefined {
  const ProviderClass = providerMap[fromFormat];
  return ProviderClass ? new ProviderClass() : undefined;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const provider = getProvider(body.fromFormat);

    if (!provider) {
      return NextResponse.json(
        { error: "Invalid fromFormat" },
        { status: 400 }
      );
    }

    const result = provider.convert({
      document: body.document,
      originalType: body.fromFormat,
      convertType: body.toFormat,
    });

    return NextResponse.json({ data: result, format: body.toFormat });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Conversion failed";
    const statusCode = errorMessage.includes("Invalid") ? 400 : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
