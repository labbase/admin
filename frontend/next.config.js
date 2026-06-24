/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.10.112"],
  output: "export",
  trailingSlash: true,
};

module.exports = nextConfig;
