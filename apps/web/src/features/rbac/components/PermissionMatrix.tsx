import { useState, useEffect } from 'react';

interface Permission {
  id: string;
  name: string;
  description: string;
}

export function PermissionMatrix({ allPermissions, currentPermissions, onAssign, onRemove }: any) {
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const map: Record<string, boolean> = {};
    currentPermissions.forEach((p: any) => {
      map[p.permissionId] = true;
    });
    setSelectedMap(map);
  }, [currentPermissions]);

  const handleToggle = async (permissionId: string, checked: boolean) => {
    setSelectedMap(prev => ({ ...prev, [permissionId]: checked }));
    if (checked) {
      await onAssign([permissionId]);
    } else {
      await onRemove([permissionId]);
    }
  };

  // Group permissions by resource prefix (e.g. "users", "roles")
  const groups = allPermissions.reduce((acc: any, curr: Permission) => {
    const [prefix] = curr.name.split('.');
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(curr);
    return acc;
  }, {});

  return (
    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/50">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Permissões do Perfil</h3>
        <p className="text-sm text-gray-500">Marque as caixas para conceder acesso às funcionalidades do sistema.</p>
      </div>
      <div className="p-6 space-y-8">
        {Object.entries(groups).map(([groupName, perms]: any) => (
          <div key={groupName}>
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 capitalize mb-4 border-b pb-2 dark:border-zinc-700">{groupName}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {perms.map((perm: Permission) => (
                <label key={perm.id} className="flex items-start space-x-3 cursor-pointer group">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={!!selectedMap[perm.id]}
                      onChange={(e) => handleToggle(perm.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-blue-600 transition-colors">{perm.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{perm.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
