import { Global, Module } from '@nestjs/common';

/**
 * Shared Kernel (Clean Architecture).
 *
 * Ce module ne contient volontairement aucune logique : il regroupe les
 * contrats transverses (interfaces d'agents, ports, événements, types
 * résultat) qui sont importés statiquement par toutes les autres couches.
 *
 * Les implémentations des ports (LLM, embeddings, recherche web) sont
 * fournies par `InfrastructureModule` à l'étape suivante. `CoreModule` reste
 * global pour matérialiser sa position de noyau partagé dans l'arborescence.
 */
@Global()
@Module({})
export class CoreModule {}
