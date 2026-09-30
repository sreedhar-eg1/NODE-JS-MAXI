const text = "This is a sample text - which need to be stored in a file";

const encoder = new TextEncoder();

Deno.writeFile("message.txt", encoder.encode(text));
