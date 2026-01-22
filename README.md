# Samples & POCs

<!-- Add badges here - examples:
![.NET Version](https://img.shields.io/badge/.NET-8.0-purple)
![License](https://img.shields.io/badge/license-MIT-blue)
![Samples](https://img.shields.io/badge/samples-12-green)
-->

A curated collection of ASP.NET Core sample projects, React, NextJs, proof-of-concepts, and learning examples. Each sample is self-contained with its own solution file and demonstrates specific patterns, features, or best practices.

## 🎯 Purpose

This repository is my personal learning and reference collection for:
- **Proof of Concepts** - Testing new features, libraries, and architectural patterns
- **Code Samples** - Reusable examples for common ASP.NET Core, React, NetJs scenarios
- **Learning Projects** - Hands-on implementations while learning new concepts
- **Quick References** - Templates for starting new projects with specific tech stacks

## 📁 Repository Structure

```
aspnetcore-samples/
├── samples/           # Individual sample projects (each with its own .sln for dotnet)
├── docs/             # Documentation, guides, and project index
├── scripts/          # Helper scripts for creating new samples
└── README.md         # This file
```

**Key principle**: Each sample is independent - no shared solution file, no inter-dependencies.

## 📚 Available Samples

> See the complete [Project Index](docs/project-index.md) for detailed categorization

### Featured Samples
<!-- Highlight 3-5 of your best/most useful samples here -->
- **[Sample Name](samples/sample-name)** - Brief one-line description
- **[Another Sample](samples/another-sample)** - What makes this one special

### By Category

#### 🌐 Web APIs
- [Minimal API Demo](samples/minimal-api-demo) - Clean minimal API patterns
- [REST API Best Practices](samples/rest-api-patterns) - Complete REST implementation
<!-- Add more as you create them -->

#### 🎨 Blazor
- Coming soon...

#### 🏗️ Patterns & Architecture  
- [Repository Pattern](samples/repository-pattern) - Generic repository with UoW
- [CQRS with MediatR](samples/cqrs-mediatr) - Command/Query separation
<!-- Add more as you create them -->

#### 💾 Database & EF Core
- [EF Core Migrations](samples/ef-migrations-demo) - Code-first migrations
<!-- Add more as you create them -->

#### 🔐 Security
- [JWT Authentication](samples/jwt-auth) - Token-based auth implementation
<!-- Add more as you create them -->

> **Full list**: Check [docs/project-index.md](docs/project-index.md) for all samples organized by category

## 🚀 Quick Start

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download) (or version specified in each sample)
- IDE: Visual Studio 2022, VS Code, or JetBrains Rider
- Git

### Running Any Sample

Each sample is completely independent. To run one:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/aspnetcore-samples.git
cd aspnetcore-samples

# 2. Navigate to any sample
cd samples/minimal-api-demo

# 3. Restore and run
dotnet restore
dotnet run --project src/MinimalApiDemo
```

Every sample includes its own README with specific setup instructions.

### Creating a New Sample

Use the helper scripts to maintain consistency:

**PowerShell:**
```powershell
./scripts/create-new-sample.ps1 -SampleName "GrpcServiceDemo" -ProjectType "grpc" -IncludeTests
```

**Bash:**
```bash
./scripts/create-new-sample.sh -n GrpcServiceDemo -t grpc -T
```

**Available Project Types:**
- `webapi` - ASP.NET Core Web API
- `mvc` - MVC application  
- `blazorserver` - Blazor Server
- `blazorwasm` - Blazor WebAssembly
- `grpc` - gRPC service
- `worker` - Worker service
- `console` - Console application

## 📖 Sample Standards

Each sample follows these conventions:

### Directory Structure
```
sample-name/
├── src/
│   └── SampleName/           # Main project
│       └── SampleName.csproj
├── tests/                    # Unit/integration tests (optional)
│   └── SampleName.Tests/
├── SampleName.sln            # Solution file
└── README.md                 # Sample-specific documentation
```

### What Each Sample Includes
- ✅ Focused on a single concept or pattern
- ✅ Complete, runnable code (not just snippets)
- ✅ Clear comments explaining key concepts
- ✅ README with setup and learning objectives
- ✅ .NET best practices and conventions

## 🎓 Learning Path

If you're new to ASP.NET Core, here's a suggested order:

1. Start with **Web API basics** - `minimal-api-demo`
2. Explore **Dependency Injection** - `di-patterns`
3. Learn **Data Access** - `ef-core-basics`
4. Add **Authentication** - `jwt-auth`
5. Implement **Patterns** - `repository-pattern`, `cqrs-mediatr`

## 🤝 Contributing (To Your Own Repo)

**Personal guidelines** for maintaining this repo:

### Before Adding a Sample
- [ ] Is it focused on one clear concept?
- [ ] Does it add value (not duplicating existing samples)?
- [ ] Is it tested and working?
- [ ] Does it have a clear README?

### Adding a New Sample
1. Use the creation script to ensure consistency
2. Write comprehensive comments in the code
3. Create a detailed README for the sample
4. Add to `docs/project-index.md` under the right category
5. Test that it runs from a fresh clone

### Code Quality Standards
- Use meaningful names
- Follow C# conventions  
- Add XML docs for public APIs
- Handle errors properly
- Use async/await for I/O
- Keep it simple and readable

## 📊 Repository Statistics

<!-- Update these as your repo grows -->
- **Total Samples**: 0 (update this!)
- **Categories**: 7
- **.NET Version**: 8.0+
- **Last Updated**: 2024-01-22

## 🔗 Useful Resources

### Official Documentation
- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core/)
- [.NET API Reference](https://docs.microsoft.com/dotnet/api/)
- [Entity Framework Core](https://docs.microsoft.com/ef/core/)

### Learning Resources
- [Microsoft Learn - ASP.NET Core](https://learn.microsoft.com/aspnet/core/)
- [.NET YouTube Channel](https://www.youtube.com/dotnet)
- [Weekly .NET Blog](https://devblogs.microsoft.com/dotnet/)

### Community
- [ASP.NET Core GitHub](https://github.com/dotnet/aspnetcore)
- [r/dotnet](https://reddit.com/r/dotnet)
- [Stack Overflow - ASP.NET Core](https://stackoverflow.com/questions/tagged/asp.net-core)

## 📝 Notes

### Why This Structure?

**No single solution file** because:
- Each sample can be opened independently
- No conflicts between different .NET versions
- Easier to copy/paste samples into other projects
- Simpler to understand without cross-dependencies
- Better for learning (each sample is complete)

**Folder naming (kebab-case)** because:
- Works on all operating systems
- Consistent with URL conventions
- Easier to type
- Industry standard for repos

## 📄 License

MIT License - feel free to use these samples in your own projects.

<!-- Optional: Add license details or link to LICENSE file -->

## 🙏 Acknowledgments

<!-- Optional: Credit any sources, tutorials, or people who inspired your samples -->
- Inspired by [Microsoft's ASP.NET Core samples](https://github.com/dotnet/AspNetCore.Docs)
- Based on patterns from [Clean Architecture](https://github.com/jasontaylordev/CleanArchitecture)

---

**Made with ❤️ for learning ASP.NET Core**

*Last updated: January 2024*
