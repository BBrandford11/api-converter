import { ConversionType } from "../types/conversion-types";

export interface ConvertParams {
document: string,
originalType: ConversionType
convertType: ConversionType
}

export abstract class BaseProvider {
  abstract parse(document: string): boolean;
  abstract validate(document: string): boolean;
  abstract convert(input:ConvertParams): string;
}
