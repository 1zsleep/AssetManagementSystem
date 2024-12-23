# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev
git init

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## 目录结构
# 📁 .nuxt // Nuxt在开发中使用.nuxt/目录来生成你的Vue应用程序。
# 📁 .output // 当构建你的应用程序用于生产时，Nuxt 会创建 .output/ 目录。
# 📁 assets // 用于添加所有将由构建工具处理的网站资产。
# 📁 components // 放置所有 Vue 组件的地方。
# 📁 composables // 将你的Vue组合式函数自动导入到你的应用程序中。
# 📁 content // 为你的应用创建一个基于文件的内容管理系统（CMS）。
# 📁 layouts // Nuxt 提供了一个布局框架，用于将常见的 UI 模式提取为可重用的布局。
# 📁 middleware // Nuxt 提供了中间件来在导航到特定路由之前运行代码。
# 📁 modules // 在应用程序中自动注册本地模块。
# 📁 node_modules // 包管理器会将项目的依赖存储在 node_modules/ 目录中。
# 📁 pages // Nuxt 提供了基于文件的路由功能，用于在你的 Web 应用中创建路由。
# 📁 plugins // Nuxt拥有一个插件系统，可以在创建Vue应用程序时使用Vue插件和其他功能。
# 📁 public // 用于提供网站的静态资源。
# 📁 server // 用于在应用程序中注册API和服务器处理程序。
# 📁 utils // 在整个应用程序中自动导入你的工具函数。
# 📄 .env // 用于指定构建和开发环境变量。
# 📄 .gitignore // 指定了Git应该忽略的故意未跟踪的文件。
# 📄 .nuxtignore // 允许 Nuxt 在构建阶段忽略项目根目录下的文件。
# 📄 app.vue // Nuxt 应用的主要组件，入口文件。
# 📄 app.config.ts // 使用App Config文件在应用程序中公开响应式配置。
# 📄 nuxt.config.ts // Nuxt可以通过一个单独的nuxt.config文件进行简单配置。
# 📄 package.json // 包含了应用程序的所有依赖项和脚本。
# 📄# tsconfig.json // Nuxt会根据你在Nuxt项目中使用的别名，以及其他合理的默认值，自动生成一个`.nuxt/tsconfig.json`文件。

