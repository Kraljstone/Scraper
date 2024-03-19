export function handleTaskError(err: Error, data: string) {
  console.log(`Error crawling ${data}: ${err.message}`);
}