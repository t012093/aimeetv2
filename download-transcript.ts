async function main() {
  const transcriptUrl = "https://us-west-2-recallai-production-bot-data.s3.amazonaws.com/_workspace-36aeb627-9d63-4e41-a09b-57c6d3f55228/recordings/e23188d0-80a4-4786-b6a3-0218910f2faa/transcript/1f863768-7f25-481f-a9af-6914f7d45e03/bot/1cae48d7-c234-4a55-ad74-060a9b1e6ab7/AROA3Z2PRSQANGTUQXHNJ%3Ai-0df50c5b413a6fc3a/diarized-processed1.1.json?AWSAccessKeyId=ASIA3Z2PRSQAPQUNOEBY&Signature=CawfGw7X1wFh1Sq%2B5Ec%2Bp8BMcSk%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEIT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJIMEYCIQDhMMNaacFPz%2BXTMRBgQzl8%2FXHhJnjwN8dZ8iiBHQ1hqQIhANbWbdxmRCvVkXLLkEsNIt8OAAobgODc7LppXzbTEj3jKroFCE0QABoMODExMzc4Nzc1MDQwIgwwy49BlY8f%2Fwm%2F9dAqlwVeFAwl9J5qrdw%2BJK7t6POJKmbMYFj879JgZku4c3jyag8Uj1D2rzzs9CN3k12YT%2BKUyMCxqAL0pLnpk9R%2FmoqSSb9ax5Gl9DU6N1qrJ3qyzkUTpDUbO4o6AIVRaKhjU1C5AgLRF89UkzdjSrldyXnmL7CLQqe3yFk9A2aTu8QohS9Q5P4F0ohRJTJcXZn%2FG4RCMEZsZR9y6uL9xqxIj5qJJSMMRVEG6F1cu2%2B51DcmLbFwfVTn9aN0Bm0Ahd7lEx2%2BXnlVXmQ0YQyHg43pY9JXjwA1CuKuWc7XzyG%2F06YgwiIwdC2SV6Gk5tct1oJvicCZrPPkn0wAxUZf%2FGYuBA3FVSmOVFMrgVIbkS0u%2FVmKAGsrxsuxIioLzbB1%2F%2FuZBJ0zmXIa2GoJ2XzO3oc3zE1kbbsWrg2LQuJ%2BGSsvH4b2zTlXHOA4bVML1qH2Wven8e1EuMXLhgYdKv4OkL54sCQh4zzkTlt5qhE3YulrydxE6JSugGTVMnM%2BrqO%2Ff1bp2%2BDXX8i1fXVx5j%2B%2F5mBsBeSRAutb%2B%2BYmPHvTh0wLrHskDML1W0VskCgdRRJYDfFTCGWKORwn%2BKv5IYnBPI7vDWxl9ucEWeBGK04z%2B%2F%2F9uiujXwib10XmX1i52u%2BdomfyM5ATaGgJISebWmIXuSL4%2BT2wwcG1iA82EbLIUbB85FiSPpRwXvU90rIApG7a0itqQRuI6njChWn%2FPBTAN%2Ffi7DgRZj7v3JuFQMyxlEuNITub%2B6UTZY9w3UC3qveqaaJSjg2iyNvwwdCMB20nuHWWyaK9I8Io6f%2Fz5tw%2Fy%2B%2FfOI0BHFkIhPmtbCFmlZs8iq78HycXmIn1hGq9JFKYRFm2cEd%2B9xot0fPKTAnvwRW%2BhzH5jDz9wMjCqgMwkJHXyAY6sAEHjOVBSvr7CS9%2FHHrDu4ZlDy%2FlSpzaDVhlteOUWNqUdxOxjAzu9ZbuMtVTLwhXt%2F%2FMd7Aeb9Bvml49rcCcY5fvcn%2F9taDeBhDauj1Nw6kLf8NinG1r5Wdx9kqBpRWJOTR4LdMsAWWy1nAJVPKXk8iIfxI4RCbP5jMWMqtm7yXkxxxx4qJAQLURRwfl%2F3F0CLG2bt01YbYvvik3wAjzB42qCtRveggd6HzbBYZSHU8S4w%3D%3D&Expires=1763076202";

  console.log('📥 Downloading transcript from S3...\n');

  const response = await fetch(transcriptUrl);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  console.log('=== Transcript Data ===');
  console.log(JSON.stringify(data, null, 2));

  console.log('\n=== Summary ===');
  console.log(`Total words: ${data.words?.length || 0}`);

  if (data.words && data.words.length > 0) {
    console.log('\n=== First 10 words ===');
    data.words.slice(0, 10).forEach((word: any, i: number) => {
      console.log(`${i + 1}. [${word.start_time}s] ${word.text} (${word.speaker})`);
    });
  }
}

main().catch(console.error);
