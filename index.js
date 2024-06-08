// Import the framework and instantiate it
import Fastify from "fastify";
import { chromium } from "playwright";
const fastify = Fastify({
  logger: true,
});

function checkUrl(string) {
  var url = "";
  try {
    url = new URL(string);
  } catch (error) {
    return false;
  }
  return true;
}

fastify.get("/", async function handler(req, reply) {
  const { query } = req;

  if (!query.url) return { statusCode: 400, body: "No url query specified." };

  if (!checkUrl(query.url))
    return { statusCode: 400, body: "No url query specified." };

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage({
      screen: {
        width: 1000,
        height: 600,
      },
    });
    await page.goto(decodeURIComponent(query.url));
    const screenshot = await page.screenshot({ path: "screenshot.jpg" });

    reply.code(200);
    reply.header("content-type", "image/jpeg");
    reply.send(screenshot);
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "The server encountered an error. You may have inputted an invalid query.",
    };
  }
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
