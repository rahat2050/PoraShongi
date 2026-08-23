import { absoluteUrl } from "@/config/seo";
import { contactConfig, siteConfig, socialLinks } from "@/config/site";

export type BreadcrumbItem = {
  name: string;
  path?: string;
};

export function websiteGraph() {
  const url = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}#organization`,
        name: siteConfig.brandName,
        alternateName: siteConfig.brandNameBangla,
        url,
        logo: absoluteUrl("/icon-512.png"),
        email: siteConfig.contactEmail,
        telephone: `+${contactConfig.hotlineE164}`,
        description: siteConfig.description,
        address: {
          "@type": "PostalAddress",
          addressLocality: contactConfig.addressLocality,
          addressRegion: contactConfig.addressRegion,
          addressCountry: contactConfig.addressCountry,
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            telephone: `+${contactConfig.hotlineE164}`,
            email: siteConfig.contactEmail,
            areaServed: "BD",
            availableLanguage: ["bn", "en"],
          },
        ],
        // Only profiles that represent the organisation itself. The LinkedIn
        // and GitHub entries in socialLinks are the developer's personal
        // accounts, and wa.me is a chat deep link — neither belongs in sameAs.
        sameAs: socialLinks
          .filter((link) => link.key === "facebook")
          .map((link) => link.href),
        areaServed: {
          "@type": "Country",
          name: "Bangladesh",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        name: siteConfig.brandName,
        alternateName: siteConfig.brandNameBangla,
        url,
        inLanguage: "bn-BD",
        description: siteConfig.description,
        publisher: { "@id": `${url}#organization` },
      },
    ],
  };
}

export function breadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

export function teacherProfileJsonLd(input: {
  name: string;
  path: string;
  description: string;
  image?: string | null;
  subjects?: string[] | null;
  district?: string | null;
  area?: string | null;
  headline?: string | null;
  ratingAvg?: number | null;
  reviewCount?: number | null;
}) {
  const url = absoluteUrl(input.path);
  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": `${url}#person`,
    name: input.name,
    url,
    jobTitle: input.headline || "Tutor",
    description: input.description,
  };
  if (input.image) person.image = input.image;
  if (input.subjects?.length) person.knowsAbout = input.subjects;
  if (input.district || input.area) {
    person.address = {
      "@type": "PostalAddress",
      ...(input.area ? { addressLocality: input.area } : {}),
      ...(input.district ? { addressRegion: input.district } : {}),
      addressCountry: "BD",
    };
  }
  if (input.reviewCount && input.reviewCount > 0 && input.ratingAvg != null) {
    person.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.ratingAvg,
      ratingCount: input.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${url}#profile`,
    url,
    name: input.name,
    description: input.description,
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    mainEntity: person,
  };
}

export function articleJsonLd(input: {
  title: string;
  path: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    inLanguage: "bn-BD",
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    publisher: {
      "@type": "Organization",
      name: siteConfig.brandName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon-512.png"),
      },
    },
  };
}

export function localTutorCollectionJsonLd(input: {
  name: string;
  path: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    url: absoluteUrl(input.path),
    description: input.description,
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    about: {
      "@type": "Thing",
      name: "Private tutors in Bangladesh",
    },
  };
}

export function teacherItemListJsonLd(input: {
  name: string;
  path: string;
  teachers: Array<{ id: string; display_name?: string | null; full_name?: string | null }>;
  total: number;
  page: number;
  pageSize: number;
}) {
  const start = (input.page - 1) * input.pageSize;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url: absoluteUrl(input.path),
    numberOfItems: input.total,
    itemListElement: input.teachers.map((teacher, index) => ({
      "@type": "ListItem",
      position: start + index + 1,
      url: absoluteUrl(`/teachers/${teacher.id}`),
      name: teacher.display_name?.trim() || teacher.full_name?.trim() || "শিক্ষক",
    })),
  };
}

/**
 * ItemList of open tuition opportunities for the public /tuitions page.
 *
 * ⚠️ ইচ্ছাকৃতভাবে schema.org/JobPosting ব্যবহার করা হয়নি: JobPosting-এ
 * hiringOrganization ও validThrough বাধ্যতামূলক, আর এগুলো ব্যক্তি-পোস্ট করা
 * টিউশন — কোনো প্রতিষ্ঠান নয়। ভুল টাইপ দিলে Google structured-data
 * penalty দিতে পারে, তাই সৎভাবে ItemList দেওয়া হয়েছে।
 */
export function tuitionItemListJsonLd(input: {
  name: string;
  path: string;
  tuitions: Array<{ id: string; title: string; subject: string; class_level: string }>;
  total: number;
  page: number;
  pageSize: number;
}) {
  const start = (input.page - 1) * input.pageSize;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url: absoluteUrl(input.path),
    numberOfItems: input.total,
    itemListElement: input.tuitions.map((tuition, index) => ({
      "@type": "ListItem",
      position: start + index + 1,
      url: absoluteUrl(`/tuitions/${tuition.id}`),
      name: tuition.title,
    })),
  };
}
