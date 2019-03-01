Haskell 期末复习题
===
<style>
s, del, s *, del * {
  color: rgba(0, 0, 0, 0);
  text-decoration: none;
}
s:hover, del:hover, s>*:hover, del>*:hover {
  color: #333;
}
s, del, s>*, del>* {  
  background-color: rgba(0, 0, 0, 0); !important;
}
</style>
### 函数参考
```
join :: Monad m => m (m a) -> m a
join = (>>= id)

on :: (b -> b -> c) -> (a -> b) -> a -> a -> c
on f g x y = f (g x) (g y)
```

### Type
写出 `Bool` 类型的定义。  
~~`data Bool = False | True`~~

写出 `1.2` 的类型。  
~~`Fractional p => p`~~

写出 `flip` 的类型。  
~~`(a -> b -> c) -> b -> a -> c`~~

写出 `uncurry (:)` 的类型。  
~~`(a, [a]) -> [a]`~~

写出 `id <*> const True` 的类型。  
~~`(Bool -> a) -> a`~~

写出一个 `Student` 类型的定义，含有 `stu_name :: String` 和 `stu_id :: Integer` 两个字段，且能使用 `show` 函数转换为字符串。  
~~`data Student = Student {stu_name :: String, stu_id :: Integer} deriving (Show)`~~

下列类型限定合法的是
* A. `3.0 :: (Integral a) => a`
* B. `return :: (->) a (r -> a)`
* C. `Nothing :: (Functor f, Num a) => f a`
* D. `(,) :: Monad m => a -> m a -> (a, m a)`

~~BD~~

### List
写出表达式 `['a', 'b'] /= "ab"` 的值。  
~~`False`~~

写出表达式 `length ['z'..'a']` 的值。  
~~`0`~~

写出表达式 `length ([0,10..89] :: [Double]) == length ([0,10..88] :: [Int])` 的值。  
~~`False`~~

写出 `\n -> foldr (++) [] (map pure [1..n])` 的时间复杂度。  
~~O(n)~~

写出 `\n -> foldl (++) [] (map pure [1..n])` 的时间复杂度。  
~~O(n^2)~~

### Functor and Applicative
使用含 `<*>` 但不含 `fib` 的表达式填空，使 fib 为斐波那契数列。
```
fib :: [Integer]
fib = 1 : 1 : (______________) fib
```
~~`zipWith (+) <*> tail`~~

将 `Monoid a => ((,) a)` 实现为 `Functor` 和 `Applicative` 类型类实例。
<s>
```
instance Functor ((,) a) where
    fmap f (x, y) = (x, f y)
instance Monoid a => Applicative ((,) a) where
    pure y = (mempty, y)
    (x1, f) <*> (x2, y) = (x1 `mappend` x2, f y)
```
</s>

### Monad
将 `(->) r` 实现为 `Monad` 类型类实例（仅需写出 `>>=` 的定义）。
<s>
```
instance Monad (->) r where
    f >>= k = \ r -> k (f r) r
```
</s>

写出 `\l m -> [x + y | x <- l, y <- m]` 去语法糖的结果（用 `>>=` 表示）。  
~~`\l m -> l >>= \x -> m >>= \y -> return $ x + y`~~

写出函数 `addPrefix` 的实现（不使用 `do`），使得输出满足要求。
```
> getLine >>= addPrefix "6A" >>= putStrLn
203 {- Input -}
6A203 {- Output -}
```
~~`addPrefix p = return . (p ++)`~~

### Foldable
写出表达式 `length $ foldMap (flip replicate [1]) [1..4]` 的值。  
~~`10`~~

用 `foldr` 定义 `foldMap` 函数。  
~~`foldMap f = foldr (mappend . f) mempty`~~

### Typeclass
实现一个 `Group` 类型类，要求接受一个 `Monoid` 类型作为类型参数，所有实例必须实现 `inverse` 函数返回逆元。
<s>
```
class Monoid a => Group a where
    inverse :: a -> a
```
</s>

将 Num a => (a, a) 与二维向量的加法运算 Vector2DSum 实现为 Semigroup, Monoid 和 Group 的实例。
<s>
```
newtype Vector2DSum a = Vector2DSum { getVector2DSum :: (a, a) }
    deriving (Eq, Ord, Show)
instance Num a => Semigroup (Vector2DSum a) where
    Vector2DSum (x1, y1) <> Vector2DSum (x2, y2) = Vector2DSum (x1 + x2, y1 + y2)
instance Num a => Monoid (Vector2DSum a) where
    mempty = Vector2DSum (0, 0)
instance Num a => Group (Vector2DSum a) where
    inverse (Vector2DSum (x, y)) = Vector2DSum (-x, -y)
```
</s>

### Evaluation
下列说法正确的是
* A. `head $ foldr (:) [] [1..]` 不会发生死循环
* B. `take 2 . sort` 的时间复杂度为 $O(n\log n)$
* C. `const 3 getLine` 中，输入不会实际发生
* D. `getLine >>= (const $ putStrLn "hello")` 中，输入不会实际发生

~~AC~~

下列表达式会引发错误的是
* A. `const True undefined`
* B. `const True $! id undefined`
* C. `const False $! [undefined]`
* D. `null $! const [undefined] False`

~~B~~

### Function Laws
下列等式不恒成立的是
* A. `pure (x .) <*> v <*> w = pure x <*> (v <*> w)`
* B. `m >>= (join . k)  =  join (m >>= k)`
* C. `join . return :: (Monad m) => m a -> m a = id :: (Monad m) => m a -> m a`
* D. `return . join :: (Monad m) => m (m a) -> m (m a) = id :: (Monad m) => m (m a) -> m (m a)`

~~D~~

证明 `(<>) = (++)` 是唯一一种将 `[a]` 实现为 `Semigroup` 类型类实例的方法。

用 `const` 和 `<*>` 定义 `(.)` 函数。  
~~`const (<*>) <*> const`~~

### Problems
实现 `fastRepeatOp`，使得其功能与 `repeatOp` 相同，时间复杂度为 $\log(n)$。
```
import Data.Monoid

repeatOp :: (Monoid a, Integral b) => a -> b -> a
repeatOp _ 0 = mempty
repeatOp x n = x `mappend` repeatOp x (n - 1)

> getProduct $ repeatOp 3 4
81
> getSum $ repeatOp 3 4
12
```

实现 36 以内任意进制转换
```
convertBase :: [Int] -> Int -> Int -> [Int]

> convertBase [1, 10] 16 10
[2, 6]
```
