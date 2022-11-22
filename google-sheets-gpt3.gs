/**
 * GPT-3 and Google Sheets - Original script from https://lifearchitect.ai/sheets/ By Dr Alan D. Thompson
 * Slightly improved by Sakher to include caching (via ThisDB free db) 
 * & other few small things - cache will be saved for 7 days for free.
 *
 * @param {string} prompt Prompt.
 * @param {number} temperature (Optional) Temperature.
 * @param {number} max_tokens (Optional) - How many tokens to generate.
 * @param {string} model (Optional) GPT-3 Model.
 * @return Response returned by GPT-3.
 * @customfunction
 */
 
const SECRET_KEY = "sk-PASTE-OPEN-AI-KEY-HERE";
 
function GPT(
  prompt,
  temperature = 0.3,
  max_tokens = 10,
  model = "text-davinci-002" // more structured and deterministic: for data
  // or "davinci"; // more flexible and creative: for stories, chatbots
) {
  // if text is empty, return empty string - no need to do that from Google Sheets!
  if (prompt == "") {
    return "-";
  }
  cached_value = get_from_cache(prompt);
  if (cached_value != null) {
    return cached_value + " [C]";
  }
  const url = "https://api.openai.com/v1/completions";
  const payload = {
    model: model,
    prompt: prompt,
    temperature: temperature,
    max_tokens: max_tokens,
  };
  const options = {
    contentType: "application/json",
    headers: { Authorization: "Bearer " + SECRET_KEY },
    payload: JSON.stringify(payload),
  };
  const res = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
  res_text = res.choices[0].text.trim();
  add_to_cache(prompt, res_text);
  return res_text;
}
 
const THISDB_API_KEY = "PASTE-THIS-DB-API-SECRET-HERE-YOU-RECEIVE-BY-EMAIL";
 
// USE THE FOLLOWIGN CURL TO CREATE A NEW BUCKET
// curl -d '' "https://api.thisdb.com/v1/"
// -H "X-Api-Key: yourapikey"
 
const THIS_DB_BUCKET_NAME = "PASTE-CREATED-BUCKET-NAME-HERE-FOR-EXAMPLE-zqjvK4C95475mAHlcOi";
 
function MD5(input) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input);
  var txtHash = "";
  for (j = 0; j < rawHash.length; j++) {
    var hashVal = rawHash[j];
    if (hashVal < 0) hashVal += 256;
    if (hashVal.toString(16).length == 1) txtHash += "0";
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}
function get_from_cache(key) {
  if (key == null) {
    return null;
  }
  const hash = MD5(key);
  const url = "https://api.thisdb.com/v1/"+THIS_DB_BUCKET_NAME+"/" + hash;
  const headers = { "X-Api-Key": THISDB_API_KEY };
  // add exception handling
  try {
    const res = UrlFetchApp.fetch(url, { headers: headers });
    if (res.getResponseCode() == 200) {
      return res.getContentText();
    }
  } catch (e) {
    return null;
  }
}
 
function add_to_cache(key, value) {
  if (key == null) {
    return null;
  }
  const hash = MD5(key);
  const url = "https://api.thisdb.com/v1/"+THIS_DB_BUCKET_NAME+"/" + hash;
  const headers = { "X-Api-Key": THISDB_API_KEY };
  const res = UrlFetchApp.fetch(url, {
    headers: headers,
    method: "post",
    payload: value,
  });
  return res;
}
