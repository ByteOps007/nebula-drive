/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns: [
            {
                protocol: "https",
                hostname: "www.shareicon.net",
            },
            {
                protocol: "https",
                hostname: "aem.dropbox.com",
            },
        ],
    },
    experimental: {
        serverComponentsExternalPackages: [
            "hypercore",
            "hyperswarm",
            "corestore",
            "sodium-native",
            "sodium-universal",
        ],
    },
};

export default nextConfig;
