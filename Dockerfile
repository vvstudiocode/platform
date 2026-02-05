FROM node:22-slim  
LABEL "language"="nodejs"  
LABEL "framework"="next.js"  
WORKDIR /src  
# 複製 package 文件  
COPY package*.json ./  
# 安裝依賴（只安裝生產依賴）  
RUN npm ci --only=production  
# 複製源代碼  
COPY . .  
# 構建應用  
RUN npm run build  
# 清理不必要的文件以減少鏡像大小  
RUN rm -rf .git .gitignore .env.example .next/cache node_modules/.cache  
EXPOSE 8080  
CMD ["npm", "start"]  
