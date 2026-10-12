---
title: "表达式转换：中缀转后缀和前缀"
pubDate: 2024-12-03
categories: ["数据结构与算法"]
description: "详解中缀表达式转后缀表达式和前缀表达式的算法实现，包括逆波兰表达式的计算方法。"
---

## 前缀转后缀

**初始化1个栈**：用于操作符（operators）。

**从左到右遍历中缀表达式**：

- 如果遇到操作数，直接添加到输出中。
- 如果遇到左括号 `(`，将其压入操作符栈。
- 如果遇到右括号 `)`，弹出操作符栈中的元素并添加到输出中，直到遇到左括号(同时舍弃左括号)。
- 如果遇到操作符，弹出操作符栈中优先级**不低于**（**大于等于**）当前操作符的所有操作符，并将它们添加到输出中，然后将当前操作符压入操作符栈。

**将剩余的操作符添加到输出**。

```c++
int precedence(char op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    return 0;
}

std::vector<std::string> infixToPostfix(const std::string& infix) {
    std::stack<char> operators;
    std::vector<std::string> output;

    for (size_t i = 0; i < infix.length(); ++i) {
        char token = infix[i];

        if (isdigit(token)) {
            std::string number;
            while (i < infix.length() && isdigit(infix[i])) {
                number += infix[i++];
            }
            --i;
            output.push_back(number); // 数字输出
        } else if (token == '(') {
            operators.push(token);  // 左括号入栈(
        } else if (token == ')') {
            // 右括号弹出操作符并输出，直到遇到左括号位为止
            while (!operators.empty() && operators.top() != '(') {
                output.push_back(std::string(1, operators.top()));
                operators.pop();
            }
            operators.pop(); // Pop the '('
        } else if (token == '+' || token == '-' || token == '*' || token == '/') {
            // 栈顶优先级 >= 当前操作符，先弹出栈顶并输出，之后入栈。
            // 栈顶优先级 < 当前操作符，入栈
            while (!operators.empty() && precedence(operators.top()) >= precedence(token)) {
                output.push_back(std::string(1, operators.top()));
                operators.pop();
            }
            operators.push(token);
        }
    }
	// 将栈中所有操作符输出，即为后缀表达式
    while (!operators.empty()) {
        output.push_back(std::string(1, operators.top()));
        operators.pop();
    }

    return output;
}
```

**计算后缀(逆波兰)表达式**

*   **从左往右**遍历存储表达式的字符串
*   如果当前字符为数字，入栈
*   如果是运算符
    *   从栈中弹出右操作数
    *   从栈中弹出左操作数
    *   根据符号进行计算，并将结果再入栈
*   当表达式扫描完后，栈里的信息就是表达式的计算结果

```c++
int evalRPN(vector<string>& tokens) {
    // 逆波兰表示法就是符号放在右边
    stack<int> s;
    for (auto& token : tokens) {
        if (token == "+" || token == "-" || token == "*" || token == "/") {
            int r = s.top(); //右操作数
            s.pop();
            int l = s.top();
            s.pop();
            if (token == "+") s.push(l + r);
            else if (token == "-") s.push(l - r);
            else if (token == "*") s.push(l * r);
            else if (token == "/") s.push(l / r);
        } else {
            s.push(atoi(token.c_str()));
        }
    }
    return s.top();
}
```

## 中缀转前缀

**中缀表达式转前缀表达式**

*   准备一个符号栈S，一个数字栈D
*   **从右向左**开始遍历中缀表达式
    *   遇到数字，压入数字栈D
    *   遇到右括号，压入符号栈S
    *   遇到运算符
        *   如果符号栈栈顶为右括号，当前运算符直接入符号栈, 可以视为右括号优先级最低，然后归结于第二点。
        *   如果符号栈栈顶运算符优先级**小于等于**当前运算符，当前运算符也直接入符号栈
        *   如果符号栈栈顶运算符优先级**大于**当前运算符，那就栈顶元素出栈然后入栈数字栈，接着继续比较，直到栈顶元素为右括号或者优先级小于等于当前运算符的运算符时，将此运算符入符号栈S
    *   遇到左括号，符号栈开始出栈，出栈元素依次进入数字栈，直到遇见右括号为止（同时舍弃左右括号）
*   将符号栈S中剩余运算符依次弹出并压入到数字栈D中
*   依次弹出数字栈D中的元素，即为最终前缀表达式结果

```c++
// 中缀转前缀
vector<string> intopre(string s) {
    // 准备两个栈
    stack<string> symbol, num;
    vector<string> res;  // 后缀表达式
    for (int i = s.size() - 1; i >= 0; i--) {
        char ch = s[i];
        if (isdigit(ch)) { // 是数字入数字栈
            string number;
            while (i >= 0 && isdigit(s[i])) {
                number += s[i--];
            }
            reverse(number.begin(), number.end());
            num.push(number);
            i++;
        } else if (ch == ')') {
            symbol.push(string(1, ch));
        } else if (ch == '(') {
            // 左括号，符号栈弹栈, 出栈元素依次进入数字栈, 同时舍弃)
            while (!symbol.empty() && symbol.top() != ")") {
                num.push(symbol.top());
                symbol.pop();
            }
            symbol.pop();
        } else if (ch == '*' || ch == '/' ||  ch == '+' || ch == '-') {
            // 符号栈栈顶大于>当前运算符，栈顶出栈入数字栈，直到栈顶为)或者优先级小于当前
            // 可以看作)优先级最低
            while (!symbol.empty() && precedence(symbol.top()) > precedence(string(1, ch))) {
                num.push(symbol.top());
                symbol.pop();
            }
            // 符号栈栈顶小于等于<=当前运算符，入栈
            symbol.push(string(1, ch));
        }  
    }
    // 将符号栈中剩余运算符依次弹出并压入数字栈
    while (!symbol.empty()) {
        num.push(symbol.top());
        symbol.pop();
    }
    // 依次弹出数字栈即为前缀表达式
    while (!num.empty()) {
        res.push_back(num.top());
        num.pop();
    }
    return res;
}
```

**前缀表达式计算**

*   **逆序** 遍历存储表达式的字符串
*   如果当前字符为数字，入栈
*   如果是运算符
    *   从栈中弹出左操作数
    *   从栈中弹出右操作数
    *   根据符号进行计算，并将结果再入栈
*   当表达式扫描完后，栈里的信息就是表达式的计算结果

练习：

[224. 基本计算器 - 力扣（LeetCode）](https://leetcode.cn/problems/basic-calculator/?envType=study-plan-v2&envId=top-interview-150)
