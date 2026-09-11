export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets", "CNAME": "CNAME", ".nojekyll": ".nojekyll" });
  eleventyConfig.addPassthroughCopy({ "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2": "assets/fonts/inter-400.woff2", "node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2": "assets/fonts/inter-500.woff2", "node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2": "assets/fonts/inter-600.woff2", "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2": "assets/fonts/inter-700.woff2" });
  eleventyConfig.addFilter("year", value => String(value || "").match(/(?:19|20)\d{2}/)?.[0] || "Undated");
  eleventyConfig.addFilter("years", items => [...new Set(items.map(item => String(item.year || "Undated")))].sort().reverse());
  eleventyConfig.addFilter("types", items => [...new Set(items.map(item => item.type))]);
  eleventyConfig.addFilter("json", value => JSON.stringify(value));
  return { dir: { input: "src", includes: "_includes", data: "_data", output: "_site" }, markdownTemplateEngine: "njk", htmlTemplateEngine: "njk", templateFormats: ["md", "njk", "html"] };
}
