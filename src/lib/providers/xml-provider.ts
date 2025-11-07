import { json2xml, xml2json } from "xml-js";

import { BaseProvider, ConvertParams } from "./base-provider";
import { ConversionType } from "../types/conversion-types";

export class XmlProvider extends BaseProvider {
  convert({ document, convertType }: ConvertParams): string {
    this.validate(document);

    if (convertType === ConversionType.JSON) {
      return xml2json(document, {
        compact: true,
        ignoreComment: true,
        spaces: 4,
      });
    }
    if (convertType === ConversionType.STRING) {
      return this.convertXmlToString(document);
    }

    throw Error("Invalid conversion type for XmlProvider");
  }

  private convertXmlToString(document: string): string {
    const jsonString = xml2json(document, { compact: true, spaces: 2 });
    const parsed = JSON.parse(jsonString);


    const segments: string[] = [];

    for (const segmentName of Object.keys(parsed)) {
      let segmentArray = parsed[segmentName];

      if (!Array.isArray(segmentArray)) {
        segmentArray = [segmentArray];
      }

      for (const segmentObject of segmentArray) {
        const values = Object.keys(segmentObject).map(
          (key) => segmentObject[key]._text || segmentObject[key]
        );
        const segmentString = `${segmentName}*${values.join("*")}~`;
        segments.push(segmentString);
      }
    }

    return segments.join("");
  }

  validate(document: string): string[] {
    if (!document || document.trim().length === 0) {
      throw new Error("Invalid XML format");
    }

    const trimmed = document.trim();

    if (!trimmed.startsWith("<")) {
      throw new Error("Invalid XML format");
    }

    if (!trimmed.includes("<root>")) {
      throw new Error("Invalid XML format");
    }

    return [document];
  }
}
