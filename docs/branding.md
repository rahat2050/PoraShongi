# Branding & Design Foundation

## Identity

| Field      | Value                                  |
| ---------- | -------------------------------------- |
| Project    | PoraShongi                             |
| Brand name | PoraShongi                             |
| Bangla name| পড়াসঙ্গী                                |
| Tagline    | পড়াশোনার সঠিক সঙ্গী                       |
| Tagline (EN)| The Right Companion for Your Studies  |
| Market     | Sunamganj / Sylhet → all Bangladesh    |

## Design goals

- Modern
- Professional
- Trustworthy
- Education-focused
- Bangladesh-friendly
- Mobile-first
- Fast
- Accessible

## Colors

Defined in `src/app/globals.css` as Tailwind CSS v4 `@theme` tokens.

### Brand green (primary)

| Token | Hex |
| ----- | --- |
| `brand-50` | `#ecfdf5` |
| `brand-100`| `#d1fae5` |
| `brand-200`| `#a7f3d0` |
| `brand-300`| `#6ee7b7` |
| `brand-400`| `#34d399` |
| `brand-500`| `#10b981` |
| `brand-600`| `#059669` (primary) |
| `brand-700`| `#047857` |
| `brand-800`| `#065f46` |
| `brand-900`| `#064e3b` |
| `brand-950`| `#022c22` |

### Accent red (Bangladesh flag red, softened)

| Token | Hex |
| ----- | --- |
| `accent-500` | `#f42a41` (primary accent) |
| `accent-600` | `#d61930` |
| `accent-700` | `#b31224` |

Neutrals use Tailwind's built-in `slate` palette.

## Typography

- **Latin:** Inter (`next/font/google`)
- **Bengali:** Hind Siliguri (`next/font/google`)
- Stack: `Inter, Hind Siliguri, ui-sans-serif, system-ui, …`

Bengali glyphs automatically fall through to Hind Siliguri, so mixed
English/Bangla text renders correctly with one font stack.

## Components

Reusable primitives live in `src/components/ui/`:

`Button`, `Input`, `Select`, `Textarea`, `Label`, `FormField`, `Card`,
`Badge`, `Modal`, `DropdownMenu`, `Spinner`, `Skeleton`, `EmptyState`,
`ErrorState`, `Alert`, `Avatar`.

Layout shells (`Header`, `Footer`, `Logo`) live in `src/components/layout/`.
