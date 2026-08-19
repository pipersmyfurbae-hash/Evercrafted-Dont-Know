import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Blueprint, EngineBlueprint } from '../types';

export interface CreateProjectInput {
  userId: string;
  name: string;
  source: string;
  blueprint: Blueprint | EngineBlueprint;
  render?: string;
  status: 'active' | 'archived';
}

/**
 * Persists a generated design as a project under the user's account.
 * Called by every design-generation surface (Memory Weaver, Inventory Weaver,
 * Image Analyzer) after a blueprint has been produced.
 */
export async function createProject(input: CreateProjectInput): Promise<string> {
  const docRef = await addDoc(collection(db, 'projects'), {
    userId: input.userId,
    name: input.name,
    source: input.source,
    blueprint: input.blueprint,
    render: input.render ?? null,
    status: input.status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}
