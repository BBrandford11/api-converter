import { describe, it, expect } from "vitest";
import { StringProvider } from "../../../src/lib/providers/string-provider";
import { ConversionType } from "../../../src/lib/types/conversion-types";

describe("StringProvider", () => {
  const provider = new StringProvider();

  describe("validate", () => {
    it("should parse valid string document with segments", () => {
      const document = "ProductID*4*8*15*16*23~AddressID*42*108*3*14~";
      const segments = provider.validate(document);

      expect(segments).toHaveLength(2);
      expect(segments[0]).toBe("ProductID*4*8*15*16*23");
      expect(segments[1]).toBe("AddressID*42*108*3*14");
    });

    it("should handle document with whitespace", () => {
      const document = "  ProductID*4*8~  AddressID*42*108~  ";
      const segments = provider.validate(document);

      expect(segments).toHaveLength(2);
      expect(segments[0].trim()).toBe("ProductID*4*8");
      expect(segments[1].trim()).toBe("AddressID*42*108");
    });

    it("should throw error for empty document", () => {
      expect(() => provider.validate("")).toThrow("Document is empty");
      expect(() => provider.validate("   ")).toThrow("Document is empty");
    });

    it("should throw error when no segments found", () => {
      const document = "~~~~";
      expect(() => provider.validate(document)).toThrow(
        "No segments found. Document must contain at least one segment separated by '~'"
      );
    });

    it("should throw error for segment without elements", () => {
      const document = "ProductID~";
      expect(() => provider.validate(document)).toThrow(
        "Invalid segment format: ProductID. Each segment must have a segment name and at least one element separated by '*'"
      );
    });

    it("should throw error for segment without segment name", () => {
      const document = "*4*8~";
      expect(() => provider.validate(document)).toThrow(
        "Invalid segment: *4*8. Segment name cannot be empty"
      );
    });

    it("should handle multiple segments with multiple elements", () => {
      const document =
        "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~AddressID*42*108*3*14~ContactID*59*26~";
      const segments = provider.validate(document);

      expect(segments).toHaveLength(4);
    });
  });

  describe("convert - String to JSON", () => {
    it("should convert single segment to JSON", () => {
      const document = "ProductID*4*8*15*16*23~";
      const result = provider.convert({
        document,
        originalType: ConversionType.STRING,
        convertType: ConversionType.JSON,
      });

      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      expect(parsed).toHaveProperty("ProductID");
      expect(parsed.ProductID).toHaveLength(1);
      expect(parsed.ProductID[0]).toEqual({
        ProductID1: "4",
        ProductID2: "8",
        ProductID3: "15",
        ProductID4: "16",
        ProductID5: "23",
      });
    });

    it("should convert multiple segments of same type to JSON", () => {
      const document = "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~";
      const result = provider.convert({
        document,
        originalType: ConversionType.STRING,
        convertType: ConversionType.JSON,
      });

      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      expect(parsed.ProductID).toHaveLength(2);
      expect(parsed.ProductID[0]).toEqual({
        ProductID1: "4",
        ProductID2: "8",
        ProductID3: "15",
        ProductID4: "16",
        ProductID5: "23",
      });
      expect(parsed.ProductID[1]).toEqual({
        ProductID1: "a",
        ProductID2: "b",
        ProductID3: "c",
        ProductID4: "d",
        ProductID5: "e",
      });
    });

    it("should convert multiple different segments to JSON", () => {
      const document =
        "ProductID*4*8*15*16*23~AddressID*42*108*3*14~ContactID*59*26~";
      const result = provider.convert({
        document,
        originalType: ConversionType.STRING,
        convertType: ConversionType.JSON,
      });

      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      expect(parsed).toHaveProperty("ProductID");
      expect(parsed).toHaveProperty("AddressID");
      expect(parsed).toHaveProperty("ContactID");
      expect(parsed.AddressID[0]).toEqual({
        AddressID1: "42",
        AddressID2: "108",
        AddressID3: "3",
        AddressID4: "14",
      });
      expect(parsed.ContactID[0]).toEqual({
        ContactID1: "59",
        ContactID2: "26",
      });
    });

    it("should handle segments with single element", () => {
      const document = "ProductID*4~";
      const result = provider.convert({
        document,
        originalType: ConversionType.STRING,
        convertType: ConversionType.JSON,
      });

      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      expect(parsed.ProductID[0]).toEqual({
        ProductID1: "4",
      });
    });
  });

  describe("convert - String to XML", () => {
    it("should convert single segment to XML", () => {
      const document = "ProductID*4*8*15*16*23~";
      const result = provider.convert({
        document,
        originalType: ConversionType.STRING,
        convertType: ConversionType.XML,
      });

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
      expect(result).toContain("<root>");
      expect(result).toContain("<ProductID>");
      expect(result).toContain("<ProductID1>4</ProductID1>");
      expect(result).toContain("<ProductID2>8</ProductID2>");
      expect(result).toContain("<ProductID3>15</ProductID3>");
      expect(result).toContain("<ProductID4>16</ProductID4>");
      expect(result).toContain("<ProductID5>23</ProductID5>");
      expect(result).toContain("</ProductID>");
      expect(result).toContain("</root>");
    });

    it("should convert multiple segments of same type to XML", () => {
      const document = "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~";
      const result = provider.convert({
        document,
        originalType: ConversionType.STRING,
        convertType: ConversionType.XML,
      });

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
      expect(result).toContain("<root>");

      const firstProductIdIndex = result.indexOf("<ProductID>");
      const firstProductIdEndIndex = result.indexOf(
        "</ProductID>",
        firstProductIdIndex
      );
      const firstSegment = result.substring(
        firstProductIdIndex,
        firstProductIdEndIndex
      );
      expect(firstSegment).toContain("<ProductID1>4</ProductID1>");
      expect(firstSegment).toContain("<ProductID5>23</ProductID5>");

      const secondProductIdIndex = result.indexOf(
        "<ProductID>",
        firstProductIdEndIndex
      );
      const secondSegment = result.substring(secondProductIdIndex);
      expect(secondSegment).toContain("<ProductID1>a</ProductID1>");
      expect(secondSegment).toContain("<ProductID5>e</ProductID5>");
    });

    it("should convert multiple different segments to XML", () => {
      const document =
        "ProductID*4*8*15*16*23~AddressID*42*108*3*14~ContactID*59*26~";
      const result = provider.convert({
        document,
        originalType: ConversionType.STRING,
        convertType: ConversionType.XML,
      });

      expect(result).toContain("<ProductID>");
      expect(result).toContain("<AddressID>");
      expect(result).toContain("<ContactID>");
      expect(result).toContain("<AddressID1>42</AddressID1>");
      expect(result).toContain("<ContactID1>59</ContactID1>");
      expect(result).toContain("<ContactID2>26</ContactID2>");
    });

    it("should format XML with proper indentation", () => {
      const document = "ProductID*4*8~";
      const result = provider.convert({
        document,
        originalType: ConversionType.STRING,
        convertType: ConversionType.XML,
      });

      const lines = result.split("\n");
      expect(lines[0]).toBe('<?xml version="1.0" encoding="UTF-8" ?>');
      expect(lines[1]).toBe("<root>");
      expect(lines[2]).toBe("  <ProductID>");
      expect(lines[3]).toContain("    <ProductID1>");
    });
  });

  describe("convert - Error handling", () => {
    it("should throw error for invalid conversion type", () => {
      const document = "ProductID*4*8~";

      expect(() => {
        provider.convert({
          document,
          originalType: ConversionType.STRING,
          convertType: ConversionType.STRING,
        });
      }).toThrow(
        "Invalid conversion type for StringProvider: STRING. Supported types: JSON, XML"
      );
    });

    it("should validate document before conversion", () => {
      const document = "";

      expect(() => {
        provider.convert({
          document,
          originalType: ConversionType.STRING,
          convertType: ConversionType.JSON,
        });
      }).toThrow("Document is empty");
    });
  });

  describe("Integration - Full example from requirements", () => {
    it("should convert full example string to JSON", () => {
      const document =
        "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~AddressID*42*108*3*14~ContactID*59*26~";
      const result = provider.convert({
        document,
        originalType: ConversionType.STRING,
        convertType: ConversionType.JSON,
      });

      const parsed = typeof result === "string" ? JSON.parse(result) : result;

      expect(parsed.ProductID).toHaveLength(2);
      expect(parsed.ProductID[0]).toEqual({
        ProductID1: "4",
        ProductID2: "8",
        ProductID3: "15",
        ProductID4: "16",
        ProductID5: "23",
      });
      expect(parsed.ProductID[1]).toEqual({
        ProductID1: "a",
        ProductID2: "b",
        ProductID3: "c",
        ProductID4: "d",
        ProductID5: "e",
      });

      expect(parsed.AddressID).toHaveLength(1);
      expect(parsed.AddressID[0]).toEqual({
        AddressID1: "42",
        AddressID2: "108",
        AddressID3: "3",
        AddressID4: "14",
      });

      expect(parsed.ContactID).toHaveLength(1);
      expect(parsed.ContactID[0]).toEqual({
        ContactID1: "59",
        ContactID2: "26",
      });
    });

    it("should convert full example string to XML", () => {
      const document =
        "ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~AddressID*42*108*3*14~ContactID*59*26~";
      const result = provider.convert({
        document,
        originalType: ConversionType.STRING,
        convertType: ConversionType.XML,
      });

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
      expect(result).toContain("<root>");

      expect(result.split("<ProductID>").length).toBe(3);
      expect(result).toContain("<AddressID>");
      expect(result).toContain("<ContactID>");

      expect(result).toContain("<ProductID1>4</ProductID1>");
      expect(result).toContain("<ProductID1>a</ProductID1>");
      expect(result).toContain("<AddressID1>42</AddressID1>");
      expect(result).toContain("<ContactID1>59</ContactID1>");
      expect(result).toContain("<ContactID2>26</ContactID2>");
      expect(result).toContain("</root>");
    });
  });
});
