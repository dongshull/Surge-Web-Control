# 使用官方 Node.js 镜像作为基础镜像
FROM node:20-slim

# 设置工作目录
WORKDIR /app

# 将当前目录的所有文件复制到 Docker 镜像的工作目录
COPY . .

# 安装依赖
RUN yarn install

# 构建应用（如果有构建步骤）
RUN yarn build

# 暴露应用的端口
EXPOSE 3080

# 启动应用
CMD ["yarn", "start"]
