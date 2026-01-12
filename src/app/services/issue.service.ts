import { Injectable } from '@angular/core';
import { Issue, IssueHistory, Tag, Feature } from '../models/issue.model';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private readonly ISSUES_KEY = 'issues';
  private readonly HISTORY_KEY = 'issues_history';
  private readonly SAVED_TAGS_KEY = 'saved_tags';
  private readonly FEATURES_KEY = 'features';

  getSavedTags(): Tag[] {
    const data = localStorage.getItem(this.SAVED_TAGS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveTag(tag: Tag): boolean {
    const tags = this.getSavedTags();
    const index = tags.findIndex(t => t.id === tag.id);

    if (index > -1) {
      tags[index] = tag;
    } else {
      tags.push(tag);
    }

    tags.sort((a, b) => a.name.localeCompare(b.name));
    localStorage.setItem(this.SAVED_TAGS_KEY, JSON.stringify(tags));
    return true;
  }

  deleteTag(id: string): boolean {
    const tags = this.getSavedTags();
    const index = tags.findIndex(t => t.id === id);
    if (index > -1) {
      tags.splice(index, 1);
      localStorage.setItem(this.SAVED_TAGS_KEY, JSON.stringify(tags));
      return true;
    }
    return false;
  }

  // Features
  getFeatures(): Feature[] {
    const data = localStorage.getItem(this.FEATURES_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveFeature(feature: Feature): boolean {
    const features = this.getFeatures();
    const index = features.findIndex(f => f.id === feature.id);

    if (index > -1) {
      features[index] = feature;
    } else {
      features.push(feature);
    }

    features.sort((a, b) => a.name.localeCompare(b.name));
    localStorage.setItem(this.FEATURES_KEY, JSON.stringify(features));
    return true;
  }

  deleteFeature(id: string): boolean {
    const features = this.getFeatures();
    const index = features.findIndex(f => f.id === id);
    if (index > -1) {
      features.splice(index, 1);
      localStorage.setItem(this.FEATURES_KEY, JSON.stringify(features));
      return true;
    }
    return false;
  }

  getIssues(): Issue[] {
    const data = localStorage.getItem(this.ISSUES_KEY);
    return data ? JSON.parse(data).map((issue: any) => ({
      ...issue,
      createdAt: new Date(issue.createdAt),
      updatedAt: new Date(issue.updatedAt),
      publishedAt: issue.publishedAt ? new Date(issue.publishedAt) : undefined,
      tags: issue.tags || [],
      features: issue.features || []
    })) : [];
  }

  saveIssue(issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Issue {
    const issues = this.getIssues();
    const now = new Date();
    const id = this.generateId();

    const issue: Issue = {
      ...issueData,
      id,
      createdAt: now,
      updatedAt: now,
      version: 1
    };

    issues.push(issue);
    localStorage.setItem(this.ISSUES_KEY, JSON.stringify(issues));
    this.addHistory(id, issue.template, now, 'created');

    return issue;
  }

  updateIssue(id: string, updates: Partial<Pick<Issue, 'userStory' | 'year' | 'sp' | 'description' | 'template' | 'tags' | 'features' | 'publishedAt'>>): Issue | null {
    const issues = this.getIssues();
    const index = issues.findIndex(issue => issue.id === id);

    if (index === -1) return null;

    const now = new Date();
    issues[index] = {
      ...issues[index],
      ...updates,
      updatedAt: now,
      version: issues[index].version + 1
    };

    localStorage.setItem(this.ISSUES_KEY, JSON.stringify(issues));
    this.addHistory(id, issues[index].template, now, 'updated');

    return issues[index];
  }

  deleteIssue(id: string): boolean {
    const issues = this.getIssues();
    const index = issues.findIndex(issue => issue.id === id);

    if (index === -1) return false;

    const issue = issues[index];
    issues.splice(index, 1);
    localStorage.setItem(this.ISSUES_KEY, JSON.stringify(issues));
    this.addHistory(id, issue.template, new Date(), 'deleted');

    return true;
  }

  getIssueById(id: string): Issue | null {
    return this.getIssues().find(issue => issue.id === id) || null;
  }

  getIssuesByTag(tagId: string): Issue[] {
    return this.getIssues().filter(issue => issue.tags.includes(tagId));
  }

  // Tag migration not strictly needed if we assume empty list or handle mixed types in UI, 
  // but for clean types we return Tag[] in getAllTags
  getAllTags(): Tag[] {
    return this.getSavedTags();
  }

  filterIssues(filters: {
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    published?: boolean;
  }): Issue[] {
    let issues = this.getIssues();

    if (filters.tags && filters.tags.length > 0) {
      issues = issues.filter(issue =>
        filters.tags!.some(tag => issue.tags.includes(tag))
      );
    }

    if (filters.dateFrom) {
      issues = issues.filter(issue => issue.createdAt >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      issues = issues.filter(issue => issue.createdAt <= endOfDay);
    }

    if (filters.published !== undefined) {
      issues = issues.filter(issue =>
        filters.published ? issue.publishedAt !== undefined : issue.publishedAt === undefined
      );
    }

    return issues;
  }

  getIssueHistory(id: string): IssueHistory[] {
    const data = localStorage.getItem(this.HISTORY_KEY);
    const history = data ? JSON.parse(data) : {};
    return (history[id] || []).map((h: any) => ({
      ...h,
      updatedAt: new Date(h.updatedAt)
    }));
  }

  private addHistory(issueId: string, template: string, date: Date, action: 'created' | 'updated' | 'deleted'): void {
    const data = localStorage.getItem(this.HISTORY_KEY);
    const history = data ? JSON.parse(data) : {};

    if (!history[issueId]) {
      history[issueId] = [];
    }

    const issue = this.getIssueById(issueId);
    history[issueId].push({
      version: issue?.version || 1,
      template,
      updatedAt: date,
      action
    });

    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}