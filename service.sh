#!/bin/bash

# 汉字书写练习服务管理脚本
# 用法:
#   ./service.sh          - 检查服务状态
#   ./service.sh start    - 启动服务
#   ./service.sh stop     - 停止服务
#   ./service.sh restart  - 重启服务

PORT=${PORT:-5173}
PID_FILE="/tmp/hanzi-writing-game.pid"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取本机局域网 IP 地址
get_local_ip() {
    local ip
    ip=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -n 1)
    
    # 如果 ifconfig 没有获取到，尝试使用 ip 命令
    if [ -z "$ip" ]; then
        ip=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1 | head -n 1)
    fi
    
    echo "$ip"
}

# 检查服务是否正在运行
is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            # PID文件存在但进程不存在，清理PID文件
            rm -f "$PID_FILE"
            return 1
        fi
    else
        # 检查端口是否被占用
        if lsof -i :$PORT | grep LISTEN > /dev/null 2>&1; then
            return 0
        else
            return 1
        fi
    fi
}

# 获取运行中的进程PID
get_pid() {
    if [ -f "$PID_FILE" ]; then
        cat "$PID_FILE"
    else
        lsof -i :$PORT | grep LISTEN | awk '{print $2}' | head -n 1
    fi
}

# 检查服务状态
check_status() {
    echo -e "${BLUE}🔍 检查汉字书写练习服务状态...${NC}"
    echo ""

    if is_running; then
        local pid=$(get_pid)
        echo -e "${GREEN}✅ 服务正在运行中${NC}"
        echo "   端口: $PORT"
        
        if [ -n "$pid" ]; then
            local command=$(ps -p "$pid" -o comm= 2>/dev/null)
            echo "   进程ID: $pid"
            echo "   进程名: ${command:-unknown}"
        fi
        
        echo ""
        echo -e "${BLUE}📱 访问地址:${NC}"
        echo "   本机: http://localhost:$PORT"
        
        local local_ip=$(get_local_ip)
        if [ -n "$local_ip" ]; then
            echo "   局域网: http://$local_ip:$PORT"
        fi
        
        echo ""
        echo -e "${YELLOW}💡 提示: 使用 './service.sh stop' 停止服务${NC}"
        
    else
        echo -e "${RED}❌ 服务未运行${NC}"
        echo "   端口 $PORT 当前未被占用"
        echo ""
        echo -e "${GREEN}🚀 启动服务:${NC}"
        echo "   ./service.sh start"
    fi

    echo ""
    echo -e "${BLUE}📊 其他检查命令:${NC}"
    echo "   查看所有相关进程: ps aux | grep vite"
    echo "   查看端口详情: lsof -i :$PORT"
}

# 启动服务
start_service() {
    if is_running; then
        echo -e "${YELLOW}⚠️  服务已在运行中${NC}"
        check_status
        return 1
    fi

    echo -e "${GREEN}🚀 启动汉字书写练习服务...${NC}"
    echo ""

    # 检查 node_modules 是否存在
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}📦 检测到未安装依赖，正在安装...${NC}"
        npm install
        echo ""
    fi

    local local_ip=$(get_local_ip)
    
    echo "========================================"
    echo "    🚀 启动汉字书写练习游戏"
    echo "========================================"
    echo ""
    echo -e "${BLUE}🌐 访问地址:${NC}"
    echo ""
    echo "   本机访问: http://localhost:$PORT"
    
    if [ -n "$local_ip" ]; then
        echo "   局域网访问: http://$local_ip:$PORT"
        echo ""
        echo -e "${BLUE}📱 请将以下链接发送给同局域网的 iPad:${NC}"
        echo ""
        echo "   http://$local_ip:$PORT"
    else
        echo "   ⚠️  未能获取到局域网 IP 地址"
    fi
    
    echo ""
    echo "========================================"
    echo ""
    echo -e "${YELLOW}💡 按 Ctrl+C 停止服务${NC}"
    echo ""

    # 启动服务并保存PID
    npx vite --host 0.0.0.0 --port $PORT &
    local pid=$!
    echo $pid > "$PID_FILE"
    
    # 等待服务启动
    sleep 2
    
    if ps -p $pid > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 服务启动成功!${NC}"
        echo "   进程ID: $pid"
        echo "   PID文件: $PID_FILE"
    else
        echo -e "${RED}❌ 服务启动失败${NC}"
        rm -f "$PID_FILE"
        return 1
    fi
}

# 停止服务
stop_service() {
    if ! is_running; then
        echo -e "${YELLOW}⚠️  服务未在运行${NC}"
        return 0
    fi

    local pid=$(get_pid)
    
    echo -e "${BLUE}🛑 正在停止服务...${NC}"
    echo "   进程ID: $pid"
    
    # 尝试优雅停止
    if [ -n "$pid" ] && kill -TERM "$pid" 2>/dev/null; then
        echo -e "${BLUE}⏳ 等待服务优雅停止...${NC}"
        sleep 3
        
        # 检查是否还需要强制停止
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  服务未响应，正在强制停止...${NC}"
            kill -9 "$pid" 2>/dev/null
            sleep 1
        fi
    fi
    
    # 清理PID文件
    rm -f "$PID_FILE"
    
    # 最终检查
    if is_running; then
        echo -e "${RED}❌ 无法停止服务，请手动检查进程${NC}"
        return 1
    else
        echo -e "${GREEN}✅ 服务已成功停止${NC}"
        return 0
    fi
}

# 重启服务
restart_service() {
    echo -e "${BLUE}🔄 重启服务...${NC}"
    stop_service
    sleep 2
    start_service
}

# 显示帮助信息
show_help() {
    echo "汉字书写练习服务管理工具"
    echo ""
    echo "用法:"
    echo "  ./service.sh [命令]"
    echo ""
    echo "命令:"
    echo "  start     启动服务"
    echo "  stop      停止服务" 
    echo "  restart   重启服务"
    echo "  status    检查服务状态（默认）"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./service.sh          # 检查服务状态"
    echo "  ./service.sh start    # 启动服务"
    echo "  ./service.sh stop     # 停止服务"
    echo ""
    echo "环境变量:"
    echo "  PORT=3000 ./service.sh  # 使用指定端口"
}

# 主程序逻辑
case "${1:-status}" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        check_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ 未知命令: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac