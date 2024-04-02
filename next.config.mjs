const nextConfig = {
    output: 'export',
    images: { unoptimized: true },
    transpilePackages: ['@ant-design', 'rc-util', 'rc-pagination', 'rc-picker', 'rc-tree', 'rc-table'], // 第三方的依赖
    reactStrictMode: true,
    webpack: (config) => {
        return config;
    },
};

export default nextConfig;