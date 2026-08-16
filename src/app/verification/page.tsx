import type { Metadata } from "next";
import { ContentList, ContentPage, ContentSection } from "@/components/shared/content-page";

export const metadata: Metadata = {
  title: "শিক্ষক ভেরিফিকেশন",
  description: "PoraSathi শিক্ষক ভেরিফিকেশন ব্যাজের অর্থ ও সীমাবদ্ধতা।",
  alternates: { canonical: "/verification" },
};

export default function VerificationPage() {
  return (
    <ContentPage title="শিক্ষক ভেরিফিকেশন" description="একটি ব্যাজ কী যাচাই হয়েছে তা বোঝায়—কিন্তু কোনো ব্যাজই নিরাপত্তা বা শিক্ষার ফলের শতভাগ নিশ্চয়তা নয়।">
      <ContentSection title="ভেরিফিকেশন স্তর">
        <ContentList>
          <li><strong>অযাচাইকৃত:</strong> তথ্য শিক্ষক নিজে দিয়েছেন; PoraSathi নথি যাচাই করেনি।</li>
          <li><strong>ফোন ভেরিফাইড:</strong> শিক্ষক নিয়ন্ত্রিত ফোন নম্বর যাচাই করা হয়েছে।</li>
          <li><strong>শিক্ষাগত যোগ্যতা ভেরিফাইড:</strong> জমা দেওয়া নির্বাচিত শিক্ষাগত নথি পর্যালোচনা করা হয়েছে।</li>
          <li><strong>আইডেন্টিটি ভেরিফাইড:</strong> পরিচয়-সংক্রান্ত নির্বাচিত নথি পর্যালোচনা করা হয়েছে।</li>
          <li><strong>Trusted Tutor:</strong> পরিচয়/যোগ্যতার পাশাপাশি পর্যাপ্ত ইতিবাচক প্ল্যাটফর্ম কার্যক্রমের মানদণ্ড পূরণ করেছে।</li>
        </ContentList>
      </ContentSection>

      <ContentSection title="ব্যাজের সীমা">
        <p>ভেরিফিকেশন জমা দেওয়া নির্দিষ্ট তথ্যের সঙ্গে সম্পর্কিত। এটি ভবিষ্যৎ আচরণ, পাঠদানের মান, অপরাধমুক্ততা বা পরীক্ষার ফলের গ্যারান্টি নয়। অভিভাবককে সাক্ষাৎ, রেফারেন্স ও মূল নথি নিজের প্রয়োজন অনুযায়ী যাচাই করতে হবে।</p>
      </ContentSection>

      <ContentSection title="ভুল বা মেয়াদোত্তীর্ণ তথ্য">
        <p>নথি অস্পষ্ট, অসামঞ্জস্যপূর্ণ, মেয়াদোত্তীর্ণ বা পরিবর্তিত হলে ব্যাজ প্রত্যাখ্যান/সরানো যেতে পারে। জাল তথ্য দিলে অ্যাকাউন্ট সীমিত বা নিষ্ক্রিয় হতে পারে। কোনো ব্যাজ নিয়ে সন্দেহ হলে শিক্ষক প্রোফাইল থেকে রিপোর্ট করুন।</p>
      </ContentSection>
    </ContentPage>
  );
}
