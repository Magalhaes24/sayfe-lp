export async function fetchDecryptedMessages() {
  const response = await fetch("http://localhost:5001/decrypt-messages");
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  return response.json();
}
