# Contributing to Gold Price Mobile

Cảm ơn bạn đã quan tâm đến việc đóng góp cho Gold Price Mobile! 🎉

## 📋 Mục lục

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Issue Guidelines](#issue-guidelines)

## 📜 Code of Conduct

### Cam kết của chúng tôi

Chúng tôi cam kết tạo ra một môi trường thân thiện và chào đón cho tất cả mọi người, bất kể:
- Kinh nghiệm
- Giới tính
- Bản sắc giới tính
- Tuổi tác
- Khuynh hướng tính dục
- Khuyết tật
- Ngoại hình
- Kích thước cơ thể
- Chủng tộc
- Dân tộc
- Tôn giáo
- Quốc tịch

### Tiêu chuẩn ứng xử

- Sử dụng ngôn ngữ chào đón và bao dung
- Tôn trọng các quan điểm và kinh nghiệm khác nhau
- Chấp nhận phê bình mang tính xây dựng
- Tập trung vào những gì tốt nhất cho cộng đồng
- Thể hiện sự đồng cảm với các thành viên khác

## 🚀 Getting Started

### 1. Fork Repository

Click nút "Fork" ở góc phải trên của repository.

### 2. Clone Fork

```bash
git clone https://github.com/YOUR_USERNAME/gold-price.git
cd gold-price/gold-price-mobile
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/original-owner/gold-price.git
```

### 4. Install Dependencies

```bash
yarn install
```

### 5. Create Branch

```bash
git checkout -b feature/your-feature-name
```

## 💻 Development Workflow

### 1. Sync với Upstream

Trước khi bắt đầu làm việc, hãy đảm bảo bạn có code mới nhất:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git checkout -b feature/your-feature-name
```

### 2. Development

```bash
# Start dev server
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android
```

### 3. Testing

```bash
# Type check
npx tsc --noEmit

# Lint
npx eslint . --ext .ts,.tsx

# Run tests
yarn test
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add awesome feature"
```

### 5. Push và Create PR

```bash
git push origin feature/your-feature-name
```

Sau đó tạo Pull Request trên GitHub.

## 🔄 Pull Request Process

### Trước khi tạo PR

- [ ] Code đã được test trên iOS/Android
- [ ] Không có TypeScript errors (`npx tsc --noEmit`)
- [ ] Không có ESLint warnings/errors
- [ ] Unit tests đã pass (nếu có)
- [ ] Documentation đã được cập nhật (nếu cần)

### Template PR

```markdown
## Description
Mô tả ngắn gọn thay đổi của bạn.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Mô tả cách bạn đã test.

## Screenshots (if applicable)
Thêm screenshots nếu có UI changes.

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. Maintainers sẽ review PR trong vòng 2-3 ngày
2. Có thể có yêu cầu thay đổi
3. Sau khi approved, PR sẽ được merge

## 📝 Coding Standards

### TypeScript

```typescript
// ✅ Good - Explicit types
interface PriceProps {
  code: string;
  buyPrice: number;
  sellPrice: number;
}

const PriceCard = ({ code, buyPrice, sellPrice }: PriceProps) => {
  // ...
};

// ❌ Bad - Any types
const PriceCard = (props: any) => {
  // ...
};
```

### Component Structure

```typescript
// 1. Imports
import React from 'react';
import { View, Text } from 'react-native';

// 2. Types
interface ComponentProps {
  title: string;
}

// 3. Component
export const Component = ({ title }: ComponentProps) => {
  // 4. Hooks
  const [state, setState] = useState(false);
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 6. Handlers
  const handlePress = () => {
    // ...
  };
  
  // 7. Render
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};
```

### Styling với NativeWind

```typescript
// ✅ Good - Sử dụng className
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold text-gold-600">
    Gold Price
  </Text>
</View>

// ❌ Bad - Inline styles (trừ khi cần thiết)
<View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
    Gold Price
  </Text>
</View>
```

### File Naming

```
components/
├── PriceCard.tsx       # PascalCase cho components
├── PriceRow.tsx
└── index.ts            # Barrel exports

hooks/
├── usePrices.ts        # camelCase với prefix 'use'
└── useAuth.ts

utils/
├── formatters.ts       # camelCase
└── helpers.ts

types/
├── price.ts            # camelCase
└── user.ts
```

### Import Order

```typescript
// 1. React/React Native
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// 3. Internal modules (absolute paths)
import { usePriceStore } from '@/stores';
import { PriceCard } from '@/components';

// 4. Relative imports
import { formatPrice } from './utils';
import type { PriceProps } from './types';
```

## 📨 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | Tính năng mới |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting, missing semi-colons, etc |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
git commit -m "feat(price): add real-time price updates"

# Bug fix
git commit -m "fix(chart): correct date formatting in tooltip"

# Documentation
git commit -m "docs: update README with new installation steps"

# Refactor
git commit -m "refactor(store): simplify price state management"
```

### Commit Best Practices

- Sử dụng imperative mood ("add" không phải "added")
- Không kết thúc subject với dấu chấm
- Giữ subject dưới 50 ký tự
- Wrap body ở 72 ký tự
- Giải thích "what" và "why", không phải "how"

## 🐛 Issue Guidelines

### Bug Report

```markdown
**Describe the bug**
Mô tả rõ ràng và ngắn gọn về bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
Mô tả behavior mong đợi.

**Screenshots**
Nếu có, thêm screenshots.

**Environment:**
- OS: [e.g. iOS 17.0, Android 14]
- Device: [e.g. iPhone 15, Pixel 8]
- App Version: [e.g. 1.0.0]

**Additional context**
Thêm context khác nếu có.
```

### Feature Request

```markdown
**Is your feature request related to a problem?**
Mô tả vấn đề. Ex. I'm always frustrated when...

**Describe the solution you'd like**
Mô tả rõ ràng solution mong muốn.

**Describe alternatives you've considered**
Mô tả các alternatives đã xem xét.

**Additional context**
Thêm context, mockups, hoặc screenshots.
```

## 🏷️ Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `documentation` | Improvements to docs |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `question` | Further information requested |
| `wontfix` | Will not be worked on |
| `duplicate` | Already exists |

## 📚 Resources

### Học React Native

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)

### Học TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Học Testing

- [Jest](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)

## ❓ Questions?

Nếu bạn có câu hỏi, hãy:

1. Xem [Issues](https://github.com/your-username/gold-price/issues) hiện có
2. Tạo [Discussion](https://github.com/your-username/gold-price/discussions)
3. Email: dev@goldprice.vn

---

**Happy Contributing! 🚀**
