---
title: "Protocol Buffer的使用"
date: 2023-03-20T13:42:01+08:00
# weight: 1
# aliases: ["/first"]
tags: ["proto buffer"]
author: "Me"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Desc Text."
canonicalURL: "https://canonical.url/to/page"
disableHLJS: true # to disable highlightjs
disableShare: true
disableHLJS: false
hideSummary: false
searchHidden: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowWordCount: true
ShowRssButtonInSectionTermList: true
UseHugoToc: true
cover:
    image: "<image path/url>" # image path/url
    alt: "<alt text>" # alt text
    caption: "<text>" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/Dueplay/blog/content"
    Text: "Suggest Changes" # edit text
    appendFilePath: true # to append file path to Edit link
---

为什么使用**Protocol Buffer**?
想象一下我们需要序列化/反序列化一个数据结构，有几种可行的方法：

+ 将原始内存数据结构保存为二进制形式。 但这是一种脆弱的方法，因为它要求读取端必须遵守完全相同的内存布局，并禁止数据格式的扩展。
+ 编写我们自己的编码策略，例如以冒号为分隔的字符串“12:3:-23:67”，这需要我们编写编码和解析代码，这也带来了运行时开销。
+ 将数据序列化为 XML 形式。 这是广泛使用的人类可读格式。 然而，XML 由于冗长而需要大量的存储空间。
  **Protocol Buffer** ：灵活、高效、自动化的解决方案

#### 定义Message

```protobuf
syntax = "proto3"; // 版本

// 相当于c++中的namespace
package tutorial;

// 相当于c++中的class/struct
message Person {
    // optional 修饰符表明该字段可能被设置，也可能不被设置。当从未设置的字段中检索值时，return系统默认值，整数为0，字符串为空等。
    optional string name = 1;
    optional int32 id = 2;
    optional string email =3;

    // 对于枚举类型，默认值是枚举类型中定义的第一个值
    enum PhoneType {
        MOBILE = 0;
        HOME = 1;
        WORK = 2;
    }

    message PhoneNumber {
        optional string number = 1;
        optional PhoneType type = 2;
    }

    // repeated 修饰符相当于数组
    repeated PhoneNumber phones = 4;
}

message AddressBook {
    repeated Person people = 1;
}
```

protobuf buffer message格式定义非常接近 C/C++ 中的类/结构定义。 有相当多的原始数据类型可用，例如int32、string，并且我们可以嵌套自定义数据类型，例如嵌套在PhoneNumber中的PhoneType，以及嵌套在AddressBook中的Person。

#### 编译Message

安装protocol buffer.在Ubuntu 22.04 LTS,通过下面方式安装

```bash
$ sudo apt install -y protobuf-compiler
```

检查它的版本是否是最新的

```bash
$ protoc --version
libprotoc 3.12.4
```

现在我们可以将 protobuf message 格式编译成 cpp 文件。 让编译器为我们生成代码。

```bash
$ ls
addressbook.proto
$ protoc --experimental_allow_proto3_optional --cpp_out=. addressbook.proto // 编译到当前目录
$ ls
addressbook.pb.cc  addressbook.pb.h  addressbook.proto
```

编译器为我们生成了addressbook.ph.h和addressbook.ph.cc。 代码里包含很多我们上面刚刚定义的消息格式的 getter 和 setter 函数。

#### 常用的message方法

在所有版本的 protobuf 中都有一些常用的方法。

- `bool IsInitialized() const`: checks if all the required fields have been set.
- `string DebugString() const`: returns a human-readable representation of the message, particularly useful for debugging.
- `void CopyFrom(const Person& from)`: overwrites the message with the given message’s values.
- `void Clear()`: clears all the elements back to the empty state.
- `bool SerializeToString(string* output) const`: serializes the message and stores the bytes in the given string. Note that the bytes are binary, not text; we only use the `string` class as a convenient container.
- `bool ParseFromString(const string& data)`: parses a message from the given string.
- `bool SerializeToOstream(ostream* output) const`: writes the message to the given C++ `ostream`.
- `bool ParseFromIstream(istream* input)`: parses a message from the given C++ `istream`.

#### 例子

一个简单的程序，将新的地址信息附加到数据文件中。

```c++
#include <iostream>
#include <fstream>
#include <string>
#include "addressbook.pb.h"

void PromptForAddress(tutorial::Person *person) {
    std::cout << "Enter person ID number: ";
    int id;
    std::cin >> id;
    person->set_id(id);
    std::cin.ignore(256, '\n');

    std::cout << "Enter name: ";
    getline(std::cin, *person->mutable_name());

    std::cout << "Enter email address (blank for none): ";
    std::string email;
    getline(std::cin, email);
    if (!email.empty()) {
        person->set_email(email);
    }

    while(true) {
        std::cout << "Enter a phone number (or leave blank to finish): ";
        std::string number;
        getline(std::cin, number);
        if (number.empty()) {
            break;
        }

        tutorial::Person::PhoneNumber *phone_number =  person->add_phones();
        phone_number->set_number(number);
        std::cout << "Is this a mobile, home, or work phone? ";
        std::string type;
        getline(std::cin, type);
        if (type == "mobile") {
            phone_number->set_type(tutorial::Person::MOBILE);
        } else if (type == "home") {
            phone_number->set_type(tutorial::Person::HOME);
        } else if (type == "work") {
            phone_number->set_type(tutorial::Person::WORK);
        } else {
            std::cout << "Unknown phone type.  Using default." << std::endl;
        }
    }
}

// 从文件中读取整个地址簿，根据用户输入添加一个人，然后将其写回到同一文件中。
int main(int argc, char* argv[]) {
    // 验证我们链接的库的版本是否与我们编译的header的版本兼容。
    GOOGLE_PROTOBUF_VERIFY_VERSION;
    if (argc != 2) {
        std::cerr << "Usage : " << argv[0] << " ADDRESSBOOK_FILE" << std::endl;
        return -1;
    }

    tutorial::AddressBook address_book;
    std::fstream ifs(argv[1], std::ios::in | std::ios::binary);
    if (!ifs) {
        std::cout << argv[1] << ": File not found.  Creating a new file." << std::endl;
    } else if (!address_book.ParseFromIstream(&ifs)) {
        std::cerr << "Failed to parse address book." << std::endl;
        return -1;
    }

    // Add an address.
    PromptForAddress(address_book.add_people());

    // Write the new address book back to disk.
    std::fstream ofs(argv[1], std::ios::out | std::ios::binary | std::ios::trunc);
    if (!address_book.SerializeToOstream(&ofs)) {
        std::cerr << "Failed to serialize address book." << std::endl;
        return -1;
    }

    // 可选: 删除 libprotobuf 分配的所有全局对象。
    google::protobuf::ShutdownProtobufLibrary();

    return 0;
}
```

读二进制文件中的消息

读上面写的数据文件并展示里面包含的所有信息.

```c++
#include <iostream>
#include <fstream>
#include <string>
#include "addressbook.pb.h"

void ListPeople(tutorial::AddressBook& address_book) {
    for (int i = 0; i < address_book.people_size(); i++) {
        const tutorial::Person& person = address_book.people(i);
        std::cout << "Person ID: " << person.id() << std::endl;
        std::cout << "  Name: " << person.name() << std::endl;
        if (person.has_email()) {
            std::cout << "  email address: " << person.email() << std::endl;
        }

        for (int j = 0; j < person.phones_size(); j++) {
            const tutorial::Person::PhoneNumber& phone_number = person.phones(j);
            switch (phone_number.type()) {
                case tutorial::Person::MOBILE:
                    std::cout << "  Mobile phone #: ";
                    break;
                    case tutorial::Person::HOME:
                        std::cout << "  Home phone #: ";
                        break;
                case tutorial::Person::WORK:
                    std::cout << "  Work phone #: ";
                    break;
            }
            std::cout << phone_number.number() << std::endl;
        }
    }
    
}

// 从文件中读取整个地址簿并打印其中的所有信息。
int main(int argc, char* argv[]) {
    // 验证我们链接的库的版本是否与我们编译的header的版本兼容。
    GOOGLE_PROTOBUF_VERIFY_VERSION;
    if (argc != 2) {
        std::cerr << "Usage : " << argv[0] << " ADDRESSBOOK_FILE" << std::endl;
        return -1;
    }

    tutorial::AddressBook address_book;
    std::fstream ifs(argv[1], std::ios::in | std::ios::binary);
    if (!address_book.ParseFromIstream(&ifs)) {
        std::cerr << "Failed to parse address book." << std::endl;
        return -1;
    }

    ListPeople(address_book);

    // 可选: 删除 libprotobuf 分配的所有全局对象。
    google::protobuf::ShutdownProtobufLibrary();

    return 0;
}
```

#### 编译运行

```bash
$ g++ -std=c++14 writer.cpp addressbook.pb.cc -o writer -lpthread -lprotobuf
$ g++ -std=c++14 reader.cpp addressbook.pb.cc -o reader -lpthread -lprotobuf
```