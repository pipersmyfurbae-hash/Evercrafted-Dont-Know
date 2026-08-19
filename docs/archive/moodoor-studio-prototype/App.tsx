/* Moodoor Studio — Botanical Instrument Panel. Separate internal shell; legacy pages remain untouched. */
import { Route, Switch, Link, useLocation } from "wouter";
import { Activity, Archive, BookOpen, Box, ChevronRight, CircleDot, Database, Layers3, Library, Search, Settings2, Sparkles } from "lucide-react";
import Home from "./pages/Home";
import LibraryPage from "./pages/Library";
import DesignDetail from "./pages/DesignDetail";
import DataHealth from "./pages/DataHealth";
import ECRInspector from "./pages/ECRInspector";
import RenderInspector from "./pages/RenderInspector";
import QCInspector from "./pages/QCInspector";
import Create from "./pages/Create";
import CreatorFlow from "./pages/CreatorFlow";
import { CollectionsPage, CollectionCreate, CollectionDetail } from "./pages/CollectionPages";
import { CuratorHome, CuratorCreate, CuratorCandidate, CuratorAdvanced } from "./pages/CuratorPages";
import { CampaignsPage, CampaignCreate, CampaignDetail } from "./pages/CampaignPages";
import { CampaignScenes, SceneAdvanced, LookbookPage } from "./pages/LifestylePages";
import { LaunchesPage, LaunchCreate, LaunchDetail } from "./pages/LaunchPages";
import { ProductionHome, OrdersPage, OrderDetail, BuildJobPage, InventoryPage } from "./pages/ProductionPages";
import { ReverseIntakeHome, ReverseIntakeReview } from "./pages/ReverseIntakePages";
import MigrationConsole from "./pages/MigrationPages";
import { PublicHome, PublicIndex, PublicEntryPage, HowMoodoorWorks, PublishingStudio, PublicEntryReview, FindYourWreath } from "./pages/PublicPages";
import NotFound from "./pages/NotFound";
import { MoodoorUXLanguage as UX } from "./lib/uxLanguage";
import { PathRibbon, pathForLocation } from "./components/PathArchitecture";

const nav = [
  { label: UX.navigation.home, href: "/studio", icon: Archive },
  { label: UX.navigation.create, href: "/studio/create", icon: Sparkles },
  { label: UX.navigation.library, href: "/studio/library", icon: Library },
  { label: UX.navigation.collections, href: "/studio/collections", icon: Layers3 },
  { label: UX.navigation.campaigns, href: "/studio/campaigns", icon: BookOpen },
  { label: UX.navigation.production, href: "/studio/production", icon: Box },
  { label: UX.navigation.publishing, href: "/studio/publishing", icon: Archive },
];

function Shell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const isHealth = location === "/studio/dev/data-health";
  return <div className="studio-app">
    <aside className="rail">
      <div className="brand-lockup"><img src="/manus-storage/moodoor-open-ring-mark_c89cbc5f.png" alt="Moodoor Studio" /><div><strong>MOODOOR</strong><span>STUDIO / S1</span></div></div>
      <div className="mode-stamp"><span className="status-dot" /> STANDARD MODE · STUDIO WORKBENCH</div>
      <nav className="rail-nav" aria-label="Studio navigation">
        <div className="rail-kicker">WORKBENCH</div>
        {nav.map(({ label, href, icon: Icon }) => <button key={label} className={`rail-link ${location === href || (href === "/studio/library" && location.startsWith("/studio/library")) ? "active" : ""}`} onClick={() => setLocation(href)}><Icon size={16} /><span>{label}</span></button>)}
      </nav>
      <div className="rail-bottom">
        <button className={`rail-link secondary-link ${location === "/studio/inventory" ? "active" : ""}`} onClick={() => setLocation("/studio/inventory")}><Database size={16} /><span>{UX.navigation.inventory}</span></button><button className={`rail-link secondary-link ${location === "/studio/migration" ? "active" : ""}`} onClick={() => setLocation("/studio/migration")}><Archive size={16} /><span>{UX.navigation.migration}</span></button><button className={`rail-link ${isHealth ? "active" : ""}`} onClick={() => setLocation("/studio/dev/data-health")}><Activity size={16} /><span>{UX.navigation.dataHealth}</span></button>
        <div className="rail-footer"><div className="footer-rule" /><span>Nothing here writes<br />back to legacy.</span></div>
      </div>
    </aside>
    <div className="main-frame">
      <header className="topbar"><div className="topbar-brand"><img src="/manus-storage/moodoor-open-ring-mark_c89cbc5f.png" alt="" /><strong>MOODOOR</strong><span>STUDIO</span></div><div className="crumb"><CircleDot size={14} /><span>WORKBENCH / STANDARD</span><ChevronRight size={13} /><strong>{isHealth ? UX.navigation.dataHealth.toUpperCase() : location.includes("/qc") ? UX.sections.advanced.toUpperCase() : location.includes("/render") ? UX.actions.render.toUpperCase() : location.includes("/ecr") ? UX.sections.advanced.toUpperCase() : location.startsWith("/studio/library") ? UX.navigation.library.toUpperCase() : location.startsWith("/studio/collections") ? UX.navigation.collections.toUpperCase() : location.startsWith("/studio/production") ? UX.navigation.production.toUpperCase() : location.startsWith("/studio/orders") ? "ORDERS" : location.startsWith("/studio/inventory") ? UX.navigation.inventory.toUpperCase() : location.startsWith("/studio/publishing") ? UX.navigation.publishing.toUpperCase() : UX.navigation.home.toUpperCase()}</strong></div><div className="top-actions"><div className="source-chip"><span className="status-dot" /> READ-ONLY SOURCE · LEGACY PRESERVED</div><button className="icon-button" aria-label="Search" onClick={() => setLocation("/studio/library")}><Search size={16} /></button><button className="icon-button" aria-label="Settings"><Settings2 size={16} /></button></div></header>
      <main className="content-frame"><PathRibbon {...pathForLocation(location)} />{children}</main>
    </div>
  </div>;
}

export default function App() {
  const [location] = useLocation();
  const publicRoute = location === "/" || location === "/find-your-wreath" || location === "/how-moodoor-works" || /^(\/(designs|collections|stories|lookbooks|campaigns))(\/|$)/.test(location);
  if (publicRoute) return <Switch><Route path="/" component={PublicHome} /><Route path="/find-your-wreath" component={FindYourWreath} /><Route path="/how-moodoor-works" component={HowMoodoorWorks} /><Route path="/designs" component={()=><PublicIndex type="DESIGN" />} /><Route path="/collections" component={()=><PublicIndex type="COLLECTION" />} /><Route path="/stories" component={()=><PublicIndex type="STORY" />} /><Route path="/lookbooks" component={()=><PublicIndex type="LOOKBOOK" />} /><Route path="/campaigns" component={()=><PublicIndex type="CAMPAIGN" />} /><Route path="/designs/:slug" component={PublicEntryPage} /><Route path="/collections/:slug" component={PublicEntryPage} /><Route path="/stories/:slug" component={PublicEntryPage} /><Route path="/lookbooks/:slug" component={PublicEntryPage} /><Route path="/campaigns/:slug" component={PublicEntryPage} /></Switch>;
  return <Shell><Switch><Route path="/studio" component={Home} /><Route path="/studio/library" component={LibraryPage} /><Route path="/library" component={LibraryPage} /><Route path="/studio/create" component={Create} /><Route path="/studio/design/:canonicalId/:view*" component={CreatorFlow} /><Route path="/studio/launches/create" component={LaunchCreate} /><Route path="/studio/launches/:launchId/:view*" component={LaunchDetail} /><Route path="/studio/launches/:launchId" component={LaunchDetail} /><Route path="/studio/launches" component={LaunchesPage} /><Route path="/studio/orders/:orderId" component={OrderDetail} /><Route path="/studio/orders" component={OrdersPage} /><Route path="/studio/inventory" component={InventoryPage} /><Route path="/studio/production/:jobId" component={BuildJobPage} /><Route path="/studio/reverse-intake/:intakeId" component={ReverseIntakeReview} /><Route path="/studio/reverse-intake" component={ReverseIntakeHome} /><Route path="/studio/migration" component={MigrationConsole} /><Route path="/studio/production" component={ProductionHome} /><Route path="/studio/publishing/:entryId" component={PublicEntryReview} /><Route path="/studio/publishing" component={PublishingStudio} /><Route path="/studio/campaigns/create" component={CampaignCreate} /><Route path="/studio/campaigns/:campaignId/scenes" component={CampaignScenes} /><Route path="/studio/campaigns/:campaignId/lookbook" component={LookbookPage} /><Route path="/studio/scenes/:sceneId/advanced" component={SceneAdvanced} /><Route path="/studio/campaigns/:campaignId/:view*" component={CampaignDetail} /><Route path="/studio/campaigns/:campaignId" component={CampaignDetail} /><Route path="/studio/campaigns" component={CampaignsPage} /><Route path="/studio/collections/curator/create" component={CuratorCreate} /><Route path="/studio/collections/curator/:candidateId/advanced" component={CuratorAdvanced} /><Route path="/studio/collections/curator/:candidateId" component={CuratorCandidate} /><Route path="/studio/collections/curator" component={CuratorHome} /><Route path="/studio/collections" component={CollectionsPage} /><Route path="/studio/collections/create" component={CollectionCreate} /><Route path="/studio/collections/:collectionId/:view*" component={CollectionDetail} /><Route path="/studio/collections/:collectionId" component={CollectionDetail} /><Route path="/studio/library/:canonicalId/qc" component={QCInspector} /><Route path="/studio/library/:canonicalId/render" component={RenderInspector} /><Route path="/studio/library/:canonicalId/ecr" component={ECRInspector} /><Route path="/studio/library/:canonicalId" component={DesignDetail} /><Route path="/studio/dev/data-health" component={DataHealth} /><Route path="/data-health" component={DataHealth} /><Route path="/create" component={Create} /><Route path="/studio/:rest*" component={() => <div className="empty-page"><h1>Coming in future sprint</h1><p>This navigation slot is intentionally present, but no legacy engine has been ported.</p><Link href="/studio">Return to Home</Link></div>} /><Route component={NotFound} /></Switch></Shell>;
}
