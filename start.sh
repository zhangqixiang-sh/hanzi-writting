#!/bin/bash

# 获取本机局域网 IP 地址
get_local_ip() {
    # 优先获取 Wi-Fi 或以太网的 IPv4 地址
    local ip
    ip=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -n 1)
    
    # 如果 ifconfig 没有获取到，尝试使用 ip 命令
    if [ -z "$ip" ]; then
        ip=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1 | head -n 1)
    fi
    
    echo "$ip"
}

# 默认端口
PORT=5173

# 检查是否指定了端口
if [ -n "$1" ]; then
    PORT=$1
fi

# 获取局域网 IP
LOCAL_IP=$(get_local_ip)

echo "========================================"
echo "    🚀 启动汉字书写练习游戏"
echo "========================================"
echo ""

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 检测到未安装依赖，正在安装..."
    npm install
    echo ""
fi

echo "🌐 访问地址:"
echo ""
echo "   本机访问: http://localhost:$PORT"

if [ -n "$LOCAL_IP" ]; then
    echo "   局域网访问: http://$LOCAL_IP:$PORT"
    echo ""
    echo "📱 请将以下链接发送给同局域网的 iPad:"
    echo ""
    echo "   http://$LOCAL_IP:$PORT"
else
    echo "   ⚠️  未能获取到局域网 IP 地址"
fi

echo ""
echo "========================================"
echo ""

# 启动 Vite 开发服务器，绑定到所有网络接口
npx vite --host 0.0.0.0 --port $PORT
