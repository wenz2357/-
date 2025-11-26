import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChefHat, Plus, Trash2, Check, ShoppingCart, Utensils, Flame, Database, RefreshCw } from 'lucide-react';

// --- 数据层：食材数据库 ---

// 常用食材预设 (已扩充以支持更多组合)
const commonIngredients = {
  proteins: [
    '鸡胸肉', '鸡腿', '鸡翅', '牛里脊', '牛腩', '牛排', '肥牛卷',
    '猪瘦肉', '五花肉', '排骨', '猪蹄', '肉末',
    '羊肉', '羊排',
    '鲈鱼', '鳕鱼', '带鱼', '黄花鱼', '三文鱼', '鲫鱼', '虾仁', '大虾', '蛤蜊', '鱿鱼', '带子',
    '鸡蛋', '鸭蛋', '鹌鹑蛋',
    '豆腐', '嫩豆腐', '老豆腐', '豆干', '腐竹', '千张'
  ],
  vegetables: [
    '西兰花', '花菜', '生菜', '娃娃菜', '大白菜', '包菜', '菠菜', '油麦菜', '空心菜', '芥兰', '韭菜', '韭黄', '芹菜', '香菜',
    '胡萝卜', '白萝卜', '青萝卜', '土豆', '红薯', '紫薯', '山药', '芋头', '莲藕',
    '黄瓜', '冬瓜', '南瓜', '苦瓜', '丝瓜', '西葫芦', '茄子', '番茄', '秋葵',
    '青椒', '红椒', '彩椒', '尖椒', '洋葱',
    '木耳', '香菇', '金针菇', '口蘑', '平菇', '杏鲍菇', '海带', '紫菜',
    '玉米', '豌豆', '荷兰豆', '四季豆', '蒜苔', '芦笋', '百合', '竹笋'
  ],
  staples: [
    '大米', '糙米', '黑米', '小米', '糯米',
    '面条', '意面', '粉丝', '米粉', '河粉', '乌冬面',
    '馒头', '全麦面包', '吐司', '年糕', '汤圆', '饺子皮', '馄饨皮'
  ],
  // 默认调料 (不计入库存匹配)
  pantry: ['葱', '姜', '蒜', '蒜蓉', '酱油', '生抽', '老抽', '蚝油', '料酒', '醋', '白醋', '陈醋', '糖', '冰糖', '盐', '鸡精', '味精', '淀粉', '面粉', '油', '香油', '橄榄油', '黄油', '黑胡椒', '花椒', '干辣椒', '辣椒粉', '咖喱粉', '豆瓣酱', '芝麻酱', '番茄酱']
};

// --- 核心名菜库 (特定名称的经典菜) ---
// 约 100+ 道，手动精选
const classicRecipes = [
  // 鸡肉类
  { name: '宫保鸡丁', ingredients: ['鸡胸肉', '胡萝卜', '黄瓜', '花生米', '干辣椒'], tags: ['经典', '微辣'], difficulty: 3, calories: 300 },
  { name: '三杯鸡', ingredients: ['鸡腿', '姜', '蒜', '九层塔'], tags: ['台式', '下饭'], difficulty: 2, calories: 350 },
  { name: '口水鸡', ingredients: ['鸡腿', '花生米', '芝麻', '辣椒油'], tags: ['川菜', '冷盘'], difficulty: 2, calories: 320 },
  { name: '香菇滑鸡', ingredients: ['鸡腿', '香菇', '姜'], tags: ['蒸菜', '低油'], difficulty: 1, calories: 280 },
  { name: '新疆大盘鸡', ingredients: ['鸡腿', '土豆', '青椒', '洋葱', '宽面'], tags: ['硬菜', '微辣'], difficulty: 3, calories: 450 },
  { name: '可乐鸡翅', ingredients: ['鸡翅', '可乐', '姜'], tags: ['甜口', '儿童最爱'], difficulty: 1, calories: 400 },
  { name: '椰子鸡汤', ingredients: ['鸡肉', '椰子水', '马蹄'], tags: ['火锅', '清淡'], difficulty: 1, calories: 300 },
  { name: '黄焖鸡', ingredients: ['鸡腿', '香菇', '青椒', '土豆'], tags: ['下饭', '经典'], difficulty: 2, calories: 380 },
  
  // 牛羊肉
  { name: '水煮牛肉', ingredients: ['牛里脊', '生菜', '豆芽', '干辣椒', '豆瓣酱'], tags: ['川菜', '麻辣'], difficulty: 3, calories: 400 },
  { name: '土豆炖牛腩', ingredients: ['牛腩', '土豆', '番茄', '洋葱'], tags: ['慢炖', '家常'], difficulty: 2, calories: 450 },
  { name: '黑椒牛柳', ingredients: ['牛里脊', '青椒', '洋葱', '黑胡椒'], tags: ['快手', '西式'], difficulty: 2, calories: 320 },
  { name: '葱爆羊肉', ingredients: ['羊肉', '大葱'], tags: ['快炒', '经典'], difficulty: 2, calories: 350 },
  { name: '手抓羊肉', ingredients: ['羊排', '花椒', '姜'], tags: ['西北', '原味'], difficulty: 1, calories: 500 },
  { name: '番茄肥牛锅', ingredients: ['肥牛卷', '番茄', '金针菇', '娃娃菜'], tags: ['酸汤', '开胃'], difficulty: 1, calories: 380 },

  // 猪肉类
  { name: '鱼香肉丝', ingredients: ['猪瘦肉', '木耳', '胡萝卜', '竹笋', '豆瓣酱'], tags: ['经典', '酸甜微辣'], difficulty: 3, calories: 320 },
  { name: '回锅肉', ingredients: ['五花肉', '蒜苗', '青椒', '豆瓣酱'], tags: ['川菜之王', '下饭'], difficulty: 3, calories: 500 },
  { name: '红烧肉', ingredients: ['五花肉', '冰糖', '姜'], tags: ['慢炖', '解馋'], difficulty: 2, calories: 600 },
  { name: '糖醋排骨', ingredients: ['排骨', '冰糖', '醋'], tags: ['酸甜', '经典'], difficulty: 2, calories: 450 },
  { name: '粉蒸肉', ingredients: ['五花肉', '蒸肉粉', '红薯'], tags: ['蒸菜', '传统'], difficulty: 2, calories: 480 },
  { name: '京酱肉丝', ingredients: ['猪瘦肉', '豆皮', '大葱', '甜面酱'], tags: ['传统', '包卷'], difficulty: 2, calories: 350 },
  { name: '梅菜扣肉', ingredients: ['五花肉', '梅干菜'], tags: ['功夫菜', '咸香'], difficulty: 4, calories: 650 },
  { name: '肉末茄子', ingredients: ['肉末', '茄子', '蒜', '豆瓣酱'], tags: ['下饭', '油润'], difficulty: 2, calories: 300 },
  { name: '蚂蚁上树', ingredients: ['肉末', '粉丝', '豆瓣酱'], tags: ['快手', '经典'], difficulty: 1, calories: 280 },

  // 鱼虾海鲜
  { name: '清蒸鲈鱼', ingredients: ['鲈鱼', '葱', '姜', '蒸鱼豉油'], tags: ['高蛋白', '低油'], difficulty: 1, calories: 120 },
  { name: '红烧带鱼', ingredients: ['带鱼', '葱', '姜', '蒜'], tags: ['家常', '下饭'], difficulty: 2, calories: 250 },
  { name: '糖醋鲤鱼', ingredients: ['鲤鱼', '番茄酱', '糖', '醋'], tags: ['宴客', '酸甜'], difficulty: 3, calories: 350 },
  { name: '油焖大虾', ingredients: ['大虾', '番茄酱', '糖'], tags: ['经典', '鲜甜'], difficulty: 2, calories: 200 },
  { name: '白灼虾', ingredients: ['大虾', '姜', '料酒'], tags: ['原味', '低脂'], difficulty: 1, calories: 100 },
  { name: '滑蛋虾仁', ingredients: ['虾仁', '鸡蛋', '葱'], tags: ['老少皆宜', '嫩滑'], difficulty: 1, calories: 220 },
  { name: '蒜蓉粉丝蒸扇贝', ingredients: ['扇贝', '粉丝', '蒜蓉'], tags: ['海鲜', '蒸菜'], difficulty: 2, calories: 150 },
  { name: '蛤蜊蒸蛋', ingredients: ['蛤蜊', '鸡蛋'], tags: ['鲜美', '低卡'], difficulty: 1, calories: 120 },
  { name: '鲫鱼豆腐汤', ingredients: ['鲫鱼', '豆腐', '姜', '葱'], tags: ['滋补', '汤品'], difficulty: 2, calories: 180 },

  // 蔬菜/豆制品/素食
  { name: '地三鲜', ingredients: ['土豆', '茄子', '青椒'], tags: ['东北', '素菜'], difficulty: 2, calories: 250 },
  { name: '麻婆豆腐', ingredients: ['嫩豆腐', '肉末', '花椒', '豆瓣酱'], tags: ['川菜', '下饭'], difficulty: 2, calories: 200 },
  { name: '家常豆腐', ingredients: ['老豆腐', '木耳', '青椒', '红椒'], tags: ['家常', '高蛋白'], difficulty: 2, calories: 220 },
  { name: '皮蛋瘦肉粥', ingredients: ['大米', '瘦肉', '皮蛋'], tags: ['早餐', '粥'], difficulty: 1, calories: 250 },
  { name: '西红柿炒鸡蛋', ingredients: ['番茄', '鸡蛋'], tags: ['国民菜', '快手'], difficulty: 1, calories: 180 },
  { name: '酸辣土豆丝', ingredients: ['土豆', '干辣椒', '醋'], tags: ['快手', '开胃'], difficulty: 1, calories: 150 },
  { name: '干煸四季豆', ingredients: ['四季豆', '肉末', '干辣椒', '花椒'], tags: ['下饭', '经典'], difficulty: 2, calories: 200 },
  { name: '耗油生菜', ingredients: ['生菜', '耗油', '蒜'], tags: ['快手', '纤维'], difficulty: 1, calories: 50 },
  { name: '上汤娃娃菜', ingredients: ['娃娃菜', '皮蛋', '火腿'], tags: ['鲜美', '汤菜'], difficulty: 2, calories: 120 },
  { name: '凉拌海带丝', ingredients: ['海带', '蒜', '醋', '辣椒油'], tags: ['凉菜', '开胃'], difficulty: 1, calories: 80 },

  // 主食/汤类
  { name: '扬州炒饭', ingredients: ['大米', '鸡蛋', '火腿', '虾仁', '豌豆', '胡萝卜'], tags: ['主食', '丰富'], difficulty: 2, calories: 400 },
  { name: '杂酱面', ingredients: ['面条', '肉末', '黄豆酱', '黄瓜'], tags: ['面食', '经典'], difficulty: 2, calories: 450 },
  { name: '罗宋汤', ingredients: ['牛腩', '番茄', '包菜', '胡萝卜', '洋葱'], tags: ['西式', '暖胃'], difficulty: 2, calories: 300 },
  { name: '排骨玉米汤', ingredients: ['排骨', '玉米', '胡萝卜'], tags: ['清淡', '滋补'], difficulty: 2, calories: 350 }
];

// --- 智能菜谱生成器 ---
// 用于填补空白，生成成百上千种家常搭配
const generateSmartRecipes = () => {
  const generated = [];
  let idCounter = 1000;

  // 1. 蔬菜 + 肉类 组合 (小炒/炖)
  commonIngredients.vegetables.forEach(veg => {
    commonIngredients.proteins.forEach(meat => {
      // 排除一些奇怪组合
      if (meat.includes('鱼') || meat.includes('骨') || meat.includes('蹄')) return; 

      generated.push({
        id: idCounter++,
        name: `${veg}炒${meat}`,
        ingredients: [veg, meat, '葱', '姜', '蒜'],
        tags: ['家常小炒', '荤素搭配'],
        difficulty: 1,
        calories: 250
      });
    });
  });

  // 2. 蔬菜 + 蔬菜 组合 (清炒/凉拌)
  for (let i = 0; i < commonIngredients.vegetables.length; i++) {
    const v1 = commonIngredients.vegetables[i];
    // 单一蔬菜做法
    generated.push({
      id: idCounter++,
      name: `蒜蓉炒${v1}`,
      ingredients: [v1, '蒜'],
      tags: ['清淡', '快手'],
      difficulty: 1,
      calories: 80
    });
    generated.push({
      id: idCounter++,
      name: `凉拌${v1}`,
      ingredients: [v1, '蒜', '醋'],
      tags: ['凉菜', '低卡'],
      difficulty: 1,
      calories: 60
    });

    // 双蔬搭配
    if (i + 1 < commonIngredients.vegetables.length) {
      const v2 = commonIngredients.vegetables[i+1];
      generated.push({
        id: idCounter++,
        name: `清炒${v1}${v2}`,
        ingredients: [v1, v2],
        tags: ['素食', '高纤维'],
        difficulty: 1,
        calories: 90
      });
    }
  }

  // 3. 汤类生成
  commonIngredients.vegetables.forEach(veg => {
     generated.push({
        id: idCounter++,
        name: `${veg}蛋花汤`,
        ingredients: [veg, '鸡蛋'],
        tags: ['汤', '快手'],
        difficulty: 1,
        calories: 100
     });
     generated.push({
        id: idCounter++,
        name: `${veg}豆腐汤`,
        ingredients: [veg, '豆腐'],
        tags: ['汤', '素食'],
        difficulty: 1,
        calories: 80
     });
  });

  // 4. 清蒸/红烧类 (针对鱼、排骨等)
  commonIngredients.proteins.forEach(prot => {
    if (prot.includes('鱼') || prot.includes('虾') || prot.includes('排骨')) {
      generated.push({
        id: idCounter++,
        name: `红烧${prot}`,
        ingredients: [prot, '姜', '葱', '酱油', '糖'],
        tags: ['硬菜', '下饭'],
        difficulty: 2,
        calories: 300
      });
      if (prot.includes('鱼') || prot.includes('虾')) {
        generated.push({
            id: idCounter++,
            name: `清蒸${prot}`,
            ingredients: [prot, '姜', '葱'],
            tags: ['清淡', '健康'],
            difficulty: 1,
            calories: 150
        });
      }
    }
  });

  return generated;
};

// 合并经典菜谱和生成菜谱
const allRecipesRaw = [
  ...classicRecipes.map((r, index) => ({ ...r, id: index + 1 })),
  ...generateSmartRecipes()
];


export default function SmartKitchenChef() {
  // --- State ---
  const [activeTab, setActiveTab] = useState('inventory'); // inventory, recipes
  
  // 初始化 State: 尝试从 LocalStorage 读取数据
  const [myInventory, setMyInventory] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('myKitchenInventory');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [customItem, setCustomItem] = useState('');
  const [notification, setNotification] = useState(null);
  const [displayCount, setDisplayCount] = useState(20); // 分页显示

  // --- Logic ---

  // 自动保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('myKitchenInventory', JSON.stringify(myInventory));
    }
  }, [myInventory]);

  // 添加库存
  const toggleIngredient = (item) => {
    if (myInventory.includes(item)) {
      setMyInventory(prev => prev.filter(i => i !== item));
    } else {
      setMyInventory(prev => [...prev, item]);
    }
  };

  const addCustomItem = () => {
    if (customItem && !myInventory.includes(customItem)) {
      setMyInventory([...myInventory, customItem]);
      setCustomItem('');
      showNotification(`已添加: ${customItem}`);
    }
  };

  // 核心算法：计算匹配度
  const processedRecipes = useMemo(() => {
    // 过滤重复名称 (优先保留经典菜谱)
    const uniqueRecipes = [];
    const names = new Set();
    
    allRecipesRaw.forEach(recipe => {
      if (!names.has(recipe.name)) {
        names.add(recipe.name);
        uniqueRecipes.push(recipe);
      }
    });

    return uniqueRecipes.map(recipe => {
      // 找出缺失的食材
      const missingIngredients = recipe.ingredients.filter(ing => {
        const isOwned = myInventory.includes(ing);
        const isPantry = commonIngredients.pantry.some(p => ing.includes(p)); 
        return !isOwned && !isPantry;
      });

      const totalIngredients = recipe.ingredients.length;
      const coreIngredients = recipe.ingredients.filter(ing => 
        !commonIngredients.pantry.some(p => ing.includes(p))
      );
      
      const missingCore = missingIngredients.length;
      const totalCore = coreIngredients.length;
      
      let matchRate = 0;
      if (totalCore === 0) {
        matchRate = 100; 
      } else {
        matchRate = Math.round(((totalCore - missingCore) / totalCore) * 100);
      }

      let status = 'cannot_cook';
      if (missingIngredients.length === 0) status = 'cook_now';
      else if (missingIngredients.length <= 1) status = 'shopping_needed'; 

      return {
        ...recipe,
        missingIngredients,
        matchRate,
        status
      };
    }).sort((a, b) => {
        // 排序优先级: 匹配度高 > 经典菜谱优先 > ID小
        if (b.matchRate !== a.matchRate) return b.matchRate - a.matchRate;
        if (a.id < 1000 && b.id >= 1000) return -1; // 经典菜ID较小，优先显示
        if (b.id < 1000 && a.id >= 1000) return 1;
        return a.id - b.id;
    });
  }, [myInventory]);

  // 烹饪操作
  const handleCook = (recipe) => {
    const ingredientsToConsume = recipe.ingredients.filter(i => 
      !commonIngredients.pantry.some(p => i.includes(p))
    );
    setMyInventory(prev => prev.filter(item => !ingredientsToConsume.includes(item)));
    showNotification(`烹饪开始！已扣除: ${ingredientsToConsume.join(', ')}`);
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Components ---
  const IngredientButton = ({ name, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        isSelected 
          ? 'bg-emerald-600 text-white shadow-md' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {name} {isSelected && <Check size={14} className="inline ml-1" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 max-w-md mx-auto shadow-2xl overflow-hidden border-x border-slate-200 relative flex flex-col">
      
      {/* Header */}
      <div className="bg-emerald-700 text-white p-6 pb-12 rounded-b-3xl shadow-lg relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="text-emerald-200" /> 智能膳食管家
          </h1>
          <span className="text-xs bg-emerald-800 px-2 py-1 rounded-full text-emerald-100">
            库存: {myInventory.length}
          </span>
        </div>
        <p className="text-emerald-100 text-sm opacity-90 flex items-center gap-2">
           <Database size={14}/> 菜谱库: {processedRecipes.length} 道 (180天不重样)
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-4 left-4 right-4 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl z-50 flex items-center justify-center animate-bounce">
          {notification}
        </div>
      )}

      {/* Main Content Area */}
      <div className="px-4 -mt-8 relative z-20 flex-1 overflow-y-auto pb-8 no-scrollbar">
        
        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm p-1 mb-4">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'inventory' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            我的冰箱
          </button>
          <button 
            onClick={() => setActiveTab('recipes')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'recipes' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            做菜去 ({processedRecipes.filter(r => r.status === 'cook_now').length})
          </button>
        </div>

        {/* Tab Content: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Input Area */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Plus size={18} className="text-emerald-600"/> 快速入库
              </h3>
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  placeholder="手动输入食材..." 
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                />
                <button 
                  onClick={addCustomItem}
                  className="bg-emerald-600 text-white px-4 rounded-lg text-sm hover:bg-emerald-700"
                >
                  添加
                </button>
              </div>

              <div className="space-y-4">
                <div className='border-b border-slate-100 pb-3'>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">肉类 & 海鲜</p>
                  <div className="flex flex-wrap gap-2">
                    {commonIngredients.proteins.map(item => (
                      <IngredientButton 
                        key={item} 
                        name={item} 
                        isSelected={myInventory.includes(item)} 
                        onClick={() => toggleIngredient(item)}
                      />
                    ))}
                  </div>
                </div>
                <div className='border-b border-slate-100 pb-3'>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">蔬菜 & 菌菇</p>
                  <div className="flex flex-wrap gap-2">
                    {commonIngredients.vegetables.map(item => (
                      <IngredientButton 
                        key={item} 
                        name={item} 
                        isSelected={myInventory.includes(item)} 
                        onClick={() => toggleIngredient(item)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">主食 & 根茎</p>
                  <div className="flex flex-wrap gap-2">
                    {commonIngredients.staples.map(item => (
                      <IngredientButton 
                        key={item} 
                        name={item} 
                        isSelected={myInventory.includes(item)} 
                        onClick={() => toggleIngredient(item)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Summary */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                 <h3 className="font-bold text-slate-700">库存清单</h3>
                 <button onClick={() => setMyInventory([])} className="text-xs text-red-400 flex items-center gap-1">
                   <Trash2 size={12}/> 清空
                 </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {myInventory.length > 0 ? (
                  myInventory.map(item => (
                    <span key={item} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                      {item}
                      <button onClick={() => toggleIngredient(item)} className="hover:text-red-500"><Trash2 size={12}/></button>
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm italic">冰箱空空如也...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: RECIPES */}
        {activeTab === 'recipes' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Filter Bar */}
            <div className="sticky top-0 bg-slate-50 pt-2 pb-2 z-10">
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                 <input 
                  type="text" 
                  placeholder={`搜索 ${processedRecipes.length} 道家常菜...`}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
            </div>

            {/* Recipe List */}
            {processedRecipes
              .filter(r => r.name.includes(searchTerm))
              .slice(0, displayCount)
              .map(recipe => (
              <div key={recipe.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
                recipe.status === 'cook_now' ? 'border-emerald-500 ring-1 ring-emerald-100' : 'border-transparent'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      {recipe.name}
                      {recipe.id < 1000 && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">经典</span>}
                    </h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {recipe.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={`text-center px-2 py-1 rounded-lg min-w-[60px] ${
                    recipe.matchRate === 100 ? 'bg-emerald-100 text-emerald-700' : 
                    recipe.matchRate > 66 ? 'bg-yellow-50 text-yellow-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <span className="block text-xs font-bold">匹配</span>
                    <span className="block font-bold text-lg">{recipe.matchRate}%</span>
                  </div>
                </div>

                <div className="my-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap gap-1 text-sm text-slate-600 mb-2">
                    {recipe.ingredients.map((ing, idx) => {
                       const isPantry = commonIngredients.pantry.some(p => ing.includes(p));
                       const isOwned = myInventory.includes(ing);
                       
                       let className = 'text-red-400 line-through decoration-red-200';
                       if (isOwned) className = 'text-emerald-600 font-bold';
                       else if (isPantry) className = 'text-slate-400';

                       return (
                        <span key={idx} className={className}>
                          {ing}{(!isOwned && !isPantry) && '?'}
                        </span>
                       );
                    }).reduce((prev, curr) => [prev, ', ', curr])}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Flame size={12}/> {recipe.calories} kcal</span>
                    <span className="flex items-center gap-1"><Utensils size={12}/> 难度: {recipe.difficulty}</span>
                  </div>

                  {recipe.status === 'cook_now' ? (
                    <button 
                      onClick={() => handleCook(recipe)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                      <Utensils size={14} /> 做这道
                    </button>
                  ) : (
                    <button className="bg-white border border-slate-200 text-slate-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-default">
                      <ShoppingCart size={14} /> 缺 {recipe.missingIngredients.length} 样
                    </button>
                  )}
                </div>
                
                {recipe.missingIngredients.length === 1 && (
                   <p className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded flex items-center gap-1">
                     💡 只差 <b>{recipe.missingIngredients[0]}</b>
                   </p>
                )}
              </div>
            ))}
            
            {/* Load More */}
            {processedRecipes.length > displayCount && (
               <button 
                onClick={() => setDisplayCount(prev => prev + 20)}
                className="w-full py-3 text-slate-400 text-sm font-medium bg-white rounded-xl shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2"
               >
                 <RefreshCw size={14}/> 加载更多菜谱...
               </button>
            )}
            
            <p className="text-center text-xs text-slate-300 py-4">
               到底啦！共为您准备了 {processedRecipes.length} 道美食
            </p>
          </div>
        )}
      </div>
    </div>
  );
}