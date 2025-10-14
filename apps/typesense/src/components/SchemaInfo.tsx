"use client";

import React from "react";

const SchemaInfo = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        VM Search Collection Schema
      </h3>
      <p className="text-blue-800 text-sm mb-3">
        Current collection fields and their capabilities:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-blue-900">
              Searchable Fields:
            </span>
            <ul className="ml-4 list-disc text-blue-800">
              <li>title</li>
              <li>content</li>
            </ul>
          </div>
          <div className="text-sm">
            <span className="font-medium text-blue-900">Display Fields:</span>
            <ul className="ml-4 list-disc text-blue-800">
              <li>title</li>
              <li>content</li>
              <li>type</li>
              <li>status</li>
              <li>slug</li>
              <li>date</li>
            </ul>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-blue-900">Faceted Fields:</span>
            <ul className="ml-4 list-disc text-blue-800">
              <li>date (available for filtering)</li>
            </ul>
          </div>
          <div className="text-sm">
            <span className="font-medium text-blue-900">Sort Fields:</span>
            <ul className="ml-4 list-disc text-blue-800">
              <li>title (default)</li>
              <li>date</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
        <strong>Note:</strong> Only faceted fields can be used for filtering. To
        add filters for &apos;type&apos; and &apos;status&apos;, the collection
        schema would need to be updated to mark these fields as faceted.
      </div>
    </div>
  );
};

export default SchemaInfo;
