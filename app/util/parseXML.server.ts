//@ts-ignore
import { parseStringPromise } from "xml2js";

export async function parseXMLToJSONString(xml: string) {
  const result = await parseStringPromise(xml, { explicitArray: false });
  return JSON.stringify(result, null, 2);
}
