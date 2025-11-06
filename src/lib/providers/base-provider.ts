import { ConversionType } from "../types/conversion-types";

export interface ConvertParams {
document: string,
originalType: ConversionType
convertType: ConversionType
}

export abstract class BaseProvider {
  abstract validate(document: string): string[];
  abstract convert(input: ConvertParams): string;
}
