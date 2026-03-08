# Goal Management System

Nuxt.jsで構築された目標管理システムです。Notion APIと連携して実データを表示します。

## Notion API セットアップ

1. [Notion Developers](https://developers.notion.com/) にアクセスしてインテグレーションを作成
2. APIキーを取得
3. Notionでデータベースを作成（以下のプロパティを設定）：
   - Name (タイトル)
   - Category (セレクト: Career, Skill, Finance, Life)
   - Specific (テキスト)
   - Measurable (テキスト)
   - Achievable (テキスト)
   - Relevant (テキスト)
   - TimeBound (日付)
   - StartDate (日付)
   - TargetYear (数字)
   - Status (セレクト: Planning, Active, Completed)
   - Progress (数字)
4. データベースをインテグレーションと共有
5. データベースIDを取得（URLから）
6. `.env`ファイルをプロジェクトルートに作成し、以下を設定：

```env
NOTION_API_KEY=your_api_key_here
NOTION_DATABASE_ID=your_database_id_here
```

## Setup

依存関係をインストール：

```bash
npm install
```

## Development Server

開発サーバーを起動：

```bash
npm run dev
```

## Production

本番ビルド：

```bash
npm run build
```

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
# GoalManagementSystem
