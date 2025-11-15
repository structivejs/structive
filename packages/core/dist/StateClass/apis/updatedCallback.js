/**
 * updatedCallback.ts
 *
 * StateClassのライフサイクルフック「$updatedCallback」を呼び出すユーティリティ関数です。
 *
 * 主な役割:
 * - オブジェクト（target）に$updatedCallbackメソッドが定義されていれば呼び出す
 * - コールバックはtargetのthisコンテキストで呼び出し、IReadonlyStateProxy（receiver）を引数として渡す
 * - 非同期関数として実行可能（await対応）
 *
 * 設計ポイント:
 * - Reflect.getで$disconnectedCallbackプロパティを安全に取得
 * - 存在しない場合は何もしない
 * - ライフサイクル管理やクリーンアップ処理に利用
 */
import { UPDATED_CALLBACK_FUNC_NAME } from "../../constants";
export async function updatedCallback(target, refs, receiver, handler) {
    const callback = Reflect.get(target, UPDATED_CALLBACK_FUNC_NAME);
    if (typeof callback === "function") {
        const paths = new Set();
        const indexesByPath = {};
        for (const ref of refs) {
            const path = ref.info.pattern;
            paths.add(path);
            if (ref.info.wildcardCount > 0) {
                const index = ref.listIndex.index;
                let indexes = indexesByPath[path];
                if (typeof indexes === "undefined") {
                    indexesByPath[path] = [index];
                }
                else {
                    indexes.push(index);
                }
            }
        }
        await callback.call(receiver, Array.from(paths), indexesByPath);
    }
}
