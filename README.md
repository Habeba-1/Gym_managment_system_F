Gym Management System (GMS)

1. نظرة عامة

نظام إدارة جيمات متعدد المستأجرين SaaS موجه للجيمات الصغيرة والمتوسطة. يهدف النظام إلى إدارة الأعضاء والاشتراكات والحضور والموظفين والمصروفات والمتجر والتقارير من خلال لوحة تحكم واحدة.

الهدف

توفير نظام بسيط وسريع يساعد صاحب الجيم وموظف الاستقبال على:

•
إدارة بيانات الأعضاء والاشتراكات.

•
تسجيل الحضور بسرعة حتى مع ضعف الاتصال.

•
معرفة حالة الأعضاء والتواصل معهم.

•
متابعة المصروفات والإيرادات وصافي الربح.

•
إدارة الموظفين والشيفتات والمتجر والمعدات.

•
عزل بيانات كل جيم عن الجيمات الأخرى.

المستخدمون الأساسيون

الدور
الاستخدام والصلاحيات
Owner
وصول كامل إلى بيانات الجيم، الأعضاء، الاشتراكات، التقارير، المصروفات، المتجر، الموظفين والإعدادات.
Receptionist
إدارة الأعضاء والاشتراكات والحضور والتواصل، مع منع الوصول إلى البيانات المالية الحساسة والإعدادات المقيدة.





النظام لا يدعم التسجيل الذاتي للمستخدمين. يتم إنشاء المستخدمين أو دعوتهم من خلال صاحب الجيم أو المسؤول عن النظام.




2. المشكلة التي يحلها النظام

تعاني الجيمات الصغيرة والمتوسطة عادةً من:

•
إدارة اشتراكات يدوية أو غير منظمة.

•
صعوبة معرفة الأعضاء الموجودين حاليًا.

•
عدم وجود تنبيهات للأعضاء الجدد أو القريب انتهاء اشتراكهم أو المنقطعين.

•
عدم وجود متابعة واضحة للإيرادات والمصروفات وصافي الربح.

•
فصل إدارة المتجر والمعدات والموظفين عن باقي العمليات.

•
صعوبة الحفاظ على البيانات عند انقطاع الإنترنت.




3. نطاق المشروع

3.1 نطاق الـ MVP

الـ MVP الأساسي يتكون من الـ Features من 0 إلى 4:

1.
المصادقة والصلاحيات.

2.
الأعضاء والاشتراكات.

3.
الحضور.

4.
التصنيف والتواصل.

5.
الداشبورد الرئيسية.

3.2 Features التوسع

الـ Features من 5 إلى 10 تمثل التوسع التشغيلي والمالي:

•
الموظفون والشيفتات.

•
المصروفات التشغيلية.

•
التقرير المالي الشامل.

•
المتجر الداخلي.

•
المعدات والصيانة.

•
التذكيرات الإدارية.

في خطة التنفيذ الحالية سيتم إنهاء جميع الـ Features من 0 إلى 10 خلال أسبوعين، مع تنفيذ الأولويات الأساسية أولًا ثم الربط والاختبار.




4. تقسيم الفريق

العضو
المسؤولية
الـ Features
يوسف
Core & Members
Feature 0 وFeature 1
مريم
Operations & Engagement
Feature 2 وFeature 3
مؤمن
Finance & Analytics
Feature 4 وFeature 6 وFeature 7
محمد
Staff, Store & Facilities
Feature 5 وFeature 8 وFeature 9 وFeature 10




مسؤولية مشتركة للفريق

•
مراجعة الـ Database Schema.

•
الاتفاق على الـ API Contract.

•
الالتزام بالـ Git workflow.

•
دعم العربية وRTL.

•
اختبار حالات Loading وSuccess وError وEmpty وDisabled.

•
فتح Pull Request قبل الدمج.




5. تفاصيل الـ Features

Feature 0 — Authentication & Authorization

المسؤول: يوسف

المطلوب

•
تسجيل الدخول باستخدام البريد الإلكتروني أو رقم الهاتف وكلمة المرور.

•
إصدار JWT Access Token بعد نجاح الدخول.

•
تفعيل Refresh Token لمدة 30 دقيقة من خلال HttpOnly Cookie.

•
تنفيذ refresh لتجديد الجلسة عند انتهاء الـ Access Token.

•
تنفيذ logout وإنهاء الجلسة.

•
استخدام bcrypt لتشفير كلمات المرور.

•
تطبيق Role-Based Access Control للأدوار Owner وReceptionist.

•
تطبيق ProtectedRoute وRoleGuard على الواجهة والـ Backend.

•
منع Self-Signup.

•
إضافة Input Validation وRate Limiting على الـ endpoints الحساسة.

•
التأكد من استخدام HTTPS في بيئة التشغيل.

User Flow

1.
يفتح المستخدم شاشة تسجيل الدخول.

2.
يدخل الهاتف أو البريد وكلمة المرور.

3.
يتحقق النظام من البيانات ويرجع Access Token وRefresh Token وgym_id.

4.
يتم تخزين الـ Refresh Token في HttpOnly Cookie.

5.
عند انتهاء الـ Access Token، يتم استدعاء /api/auth/refresh تلقائيًا.

6.
عند تسجيل الخروج يتم إلغاء الجلسة.

API

Plain Text


POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout



معايير القبول

•
بيانات الدخول الصحيحة تعيد Token صالحًا.

•
بيانات الدخول الخاطئة تعيد رسالة خطأ واضحة.

•
أي endpoint محمي يرفض الطلب بدون Token صالح.

•
المستخدم لا يستطيع الوصول إلى بيانات جيم آخر.

•
صلاحيات Owner وReceptionist تعمل على الـ Backend وليس الواجهة فقط.




Feature 1 — Members & Subscriptions

المسؤول: يوسف

المطلوب

•
CRUD كامل للأعضاء.

•
البحث والتصفية عن الأعضاء.

•
الحقول الأساسية: الاسم، الهاتف، البريد، الصورة، تاريخ الانضمام.

•
Soft Delete للأعضاء بدل الحذف النهائي.

•
CRUD للباقات.

•
أنواع الباقات مثل يومي أو أسبوعي أو 2x/3x أسبوعيًا.

•
تحديد مدة الباقة وسعرها وabsence_threshold_days.

•
إنشاء الاشتراك وتجديده.

•
تثبيت طريقة الدفع على Cash في نسخة الـ MVP.

•
حفظ حالة الدفع.

•
تحديد start_date وend_date.

•
تطبيق gym_id على جميع السجلات.

API

Plain Text


GET    /api/members
POST   /api/members
GET    /api/members/{id}
PUT    /api/members/{id}
DELETE /api/members/{id}

GET    /api/plans
POST   /api/plans
PUT    /api/plans/{id}
DELETE /api/plans/{id}

POST   /api/subscriptions
POST   /api/subscriptions/renew



معايير القبول

•
يمكن إنشاء وتعديل وعرض وحذف العضو حذفًا منطقيًا.

•
لا يمكن إنشاء عضو ببيانات غير صحيحة أو رقم مكرر.

•
يمكن إنشاء باقة وربطها باشتراك.

•
لا يمكن لمستخدم من جيم الوصول إلى أعضاء جيم آخر.

•
يتم تحديث end_date بشكل صحيح عند التجديد.




Feature 2 — Attendance

المسؤول: مريم

المطلوب

•
تسجيل الحضور بسرعة بالبحث عن الاسم أو الهاتف.

•
دعم QR Check-in إذا تم اعتماده ضمن الـ MVP.

•
التحقق من صلاحية الاشتراك قبل تسجيل الحضور.

•
تسجيل check_in_time.

•
تحديث last_attendance للعضو.

•
شاشة "الموجودين حاليًا".

•
دعم Offline Sync باستخدام local_id.

•
منع تكرار سجل الحضور عند المزامنة.

•
استخدام تخزين محلي مثل IndexedDB أو LocalStorage عند الحاجة.

API

Plain Text


POST /api/attendance/check-in
GET  /api/attendance/today
POST /api/attendance/sync



معايير القبول

•
تسجيل حضور العضو ذي الاشتراك الساري ينجح فورًا.

•
العضو منتهي الاشتراك يحصل على رسالة واضحة ولا يتم تسجيل حضوره.

•
شاشة الموجودين تعرض بيانات اليوم.

•
الطلبات التي تمت Offline تتم مزامنتها بعد عودة الاتصال.

•
local_id يمنع تكرار نفس العملية.

Edge Cases

•
العضو يحاول تسجيل الحضور مرتين في نفس الوقت.

•
الجهاز يعود للاتصال بعد وجود عدة عمليات محلية.

•
العضو غير موجود.

•
العضو لديه اشتراك منتهي.

•
اختلاف الوقت أو التاريخ بين الجهاز والسيرفر.




Feature 3 — Classification & Communication

المسؤول: مريم

المطلوب

تقسيم الأعضاء إلى أربع فئات:

1.
New — عضو جديد.

2.
Expiring — الاشتراك قريب من الانتهاء.

3.
Inactive — عضو مختفي حسب حد الغياب.

4.
Expired — الاشتراك منتهي.

يعتمد التصنيف على:

•
last_attendance.

•
end_date.

•
absence_threshold_days.

•
حالة الاشتراك.

التواصل

•
إدارة قوالب الرسائل.

•
قالب لكل فئة.

•
تعديل نص الرسالة.

•
توليد رابط WhatsApp من نوع wa.me.

•
لا يوجد إرسال تلقائي في الـ MVP؛ يتم فتح الرابط للمستخدم.

API

Plain Text


GET /api/members/segmented
GET /api/message-templates
PUT /api/message-templates/{id}



معايير القبول

•
العضو يظهر في الفئة الصحيحة.

•
الأعداد في التبويبات متوافقة مع البيانات.

•
الرسالة الصحيحة ترتبط بالفئة الصحيحة.

•
رابط WhatsApp يحتوي رقم الهاتف والنص بعد ترميزه بشكل صحيح.




Feature 4 — Main Dashboard

المسؤول: مؤمن

المطلوب

•
كروت الأرقام السريعة.

•
إجمالي الأعضاء.

•
الاشتراكات السارية والقريبة من الانتهاء والمنتهية.

•
عدد الموجودين اليوم.

•
عدادات التصنيفات الأربعة.

•
فلاتر حسب الحالة والفترة.

•
Charts مناسبة للبيانات.

•
دعم RTL وResponsive UI.

•
حالات Loading وEmpty وError.

API

Plain Text


GET /api/dashboard/stats



معايير القبول

•
الأرقام في الداشبورد تأتي من البيانات الفعلية.

•
الفلاتر تحدث النتائج بشكل صحيح.

•
لا تظهر أخطاء عند عدم وجود بيانات.

•
الداشبورد تعمل على أحجام الشاشات الأساسية.




Feature 5 — Staff & Shifts

المسؤول: محمد

المطلوب

•
إدارة الموظفين والمدربين.

•
الأدوار: owner وreceptionist وtrainer.

•
إنشاء وتعديل وحذف الشيفتات.

•
تقويم للشيفتات.

•
حضور وانصراف الموظفين منفصل عن الأعضاء.

•
حفظ check_in_time وcheck_out_time.

API

Plain Text


GET  /api/staff
POST /api/staff
GET  /api/shifts
POST /api/shifts
POST /api/staff/attendance






Feature 6 — Operational Expenses

المسؤول: مؤمن

المطلوب

•
تسجيل وتعديل وحذف المصروفات.

•
التصنيفات:

•
Rent — إيجار.

•
Salaries — مرتبات.

•
Bills — فواتير.

•
Maintenance — صيانة.

•
Other — أخرى.



•
حفظ المبلغ والتاريخ والملاحظات.

•
الفلاتر الزمنية والتصنيف.

•
إجمالي المصروفات.

•
عزل البيانات باستخدام gym_id.

API

Plain Text


GET  /api/expenses
POST /api/expenses






Feature 7 — Comprehensive Financial Report

المسؤول: مؤمن

المطلوب

حساب صافي الربح تلقائيًا وفق المعادلة:

Plain Text


Net Profit = Cash Subscription Revenue + Store Sales - Expenses



مصادر البيانات

•
إيرادات الاشتراكات التي طريقة دفعها Cash.

•
إجمالي مبيعات المتجر.

•
إجمالي المصروفات.

API

Plain Text


GET /api/reports/financial-summary



معايير القبول

•
المعادلة تحسب النتائج بشكل صحيح.

•
الفلاتر الزمنية تعمل.

•
لا يتم احتساب بيانات من جيم آخر.

•
التقرير يعرض حالة واضحة عند عدم وجود بيانات.




Feature 8 — Internal Store

المسؤول: محمد

المطلوب

•
إدارة المنتجات.

•
حفظ الاسم والكمية وسعر الوحدة.

•
البيع السريع.

•
تسجيل عمليات البيع.

•
خصم المخزون تلقائيًا بعد البيع.

•
منع البيع عند نفاد الكمية.

•
حساب إجمالي العملية.

API

Plain Text


GET  /api/store/products
POST /api/store/products
POST /api/store/sales






Feature 9 — Equipment & Maintenance

المسؤول: محمد

المطلوب

•
سجل المعدات.

•
الاسم وتاريخ الشراء.

•
تاريخ آخر صيانة.

•
حساب موعد الصيانة القادمة.

•
عرض المعدات المستحقة للصيانة.

•
تعديل بيانات المعدات.

API

Plain Text


GET  /api/equipment
POST /api/equipment
PUT  /api/equipment/{id}






Feature 10 — Administrative Reminders

المسؤول: محمد

المطلوب

•
إنشاء التذكيرات الإدارية.

•
عنوان التذكير.

•
تاريخ الاستحقاق.

•
ملاحظة التذكير.

•
عرض التذكيرات القادمة والمستحقة.

•
ربط التذكيرات بـ gym_id.

API

Plain Text


GET  /api/reminders
POST /api/reminders






6. Database Schema

Gyms

الحقل
الوصف
id
المعرف الأساسي
name
اسم الجيم
owner_phone
رقم صاحب الجيم
subscription_tier
نوع اشتراك الجيم في النظام
created_at
تاريخ الإنشاء




Members

الحقل
الوصف
id
المعرف
gym_id
الجيم المالك للبيانات
name
اسم العضو
phone
الهاتف
email
البريد
photo_url
رابط الصورة
join_date
تاريخ الانضمام
deleted_at
تاريخ الـ Soft Delete إن وجد




Plans

الحقل
الوصف
id
المعرف
gym_id
الجيم
name
اسم الباقة
type
نوع الباقة
duration_days
المدة بالأيام
price
السعر
absence_threshold_days
حد اعتبار العضو مختفيًا




Subscriptions

الحقل
الوصف
id
المعرف
member_id
العضو
plan_id
الباقة
start_date
بداية الاشتراك
end_date
نهاية الاشتراك
payment_status
حالة الدفع
payment_method
طريقة الدفع، Cash في الـ MVP




Attendance

الحقل
الوصف
id
المعرف
member_id
العضو
check_in_time
وقت الحضور
local_id
معرف العملية المحلية للمزامنة




Message_Templates

الحقل
الوصف
id
المعرف
gym_id
الجيم
category
new / expiring / inactive / expired
template_text
نص الرسالة




Staff

الحقل
الوصف
id
المعرف
gym_id
الجيم
name
الاسم
phone
الهاتف
role
owner / receptionist / trainer




Shifts

الحقل
الوصف
id
المعرف
staff_id
الموظف
shift_date
تاريخ الشيفت
start_time
وقت البداية
end_time
وقت النهاية




Staff_Attendance

الحقل
الوصف
id
المعرف
staff_id
الموظف
check_in_time
وقت الحضور
check_out_time
وقت الانصراف




Expenses

الحقل
الوصف
id
المعرف
gym_id
الجيم
category
rent / salaries / bills / maintenance / other
amount
المبلغ
expense_date
التاريخ
notes
ملاحظات




Store_Products

الحقل
الوصف
id
المعرف
gym_id
الجيم
name
اسم المنتج
quantity
الكمية
unit_price
سعر الوحدة




Store_Sales

الحقل
الوصف
id
المعرف
gym_id
الجيم
product_id
المنتج
quantity_sold
الكمية المباعة
total_amount
إجمالي البيع
sale_date
تاريخ البيع




Equipment

الحقل
الوصف
id
المعرف
gym_id
الجيم
name
اسم المعدة
purchase_date
تاريخ الشراء
last_maintenance_date
آخر صيانة
next_maintenance_due
الصيانة القادمة




Admin_Reminders

الحقل
الوصف
id
المعرف
gym_id
الجيم
title
عنوان التذكير
due_date
تاريخ الاستحقاق
reminder_note
الملاحظة







7. Multi-tenancy وعزل البيانات

النظام SaaS ويخدم أكثر من جيم على نفس التطبيق. لذلك:

•
كل جدول تشغيلي يجب أن يحتوي على gym_id مباشرة أو من خلال علاقة واضحة.

•
يتم استخراج gym_id من المستخدم بعد تسجيل الدخول.

•
لا يرسل العميل gym_id كمرجع موثوق وحده؛ الـ Backend يفرضه من الجلسة.

•
كل Query يجب أن يفلتر حسب gym_id.

•
لا يستطيع Owner من جيم الوصول إلى بيانات جيم آخر.

•
يجب تطبيق العزل على الـ API وليس على الواجهة فقط.




8. Tech Stack المقترح

الجزء
التقنية
Frontend
React / Next.js
Backend
Laravel PHP
Database
MySQL
State Management
Zustand أو Context للـ Global State
Server State
React Query
Forms
React Hook Form + Zod أو بديل مناسب
Authentication
JWT + Refresh Token + HttpOnly Cookie
WhatsApp
Click-to-Chat باستخدام wa.me
Hosting
Railway أو Render




قواعد Frontend

•
استخدام React Query لكل Server State.

•
عدم إعادة اختراع useState + useEffect لكل API.

•
استخدام Axios instance مع Interceptors للـ JWT.

•
التعامل مع 401 وتجديد الجلسة تلقائيًا.

•
استخدام Protected Routes وRole Guards.

•
دعم RTL من أول يوم وليس في نهاية المشروع.

•
توحيد Loading/Error/Empty/Disabled states.

قواعد Backend

•
الصلاحيات تطبق على الـ Backend دائمًا.

•
إضافة Validation وSanitization لكل مدخلات المستخدم.

•
استخدام Rate Limiting على Login وEndpoints الحساسة.

•
عدم إرجاع بيانات جيم آخر حتى لو تم تعديل الطلب يدويًا.

•
استخدام Responses موحدة.




9. API Contract

Headers

Plain Text


Authorization: Bearer <access_token>
Content-Type: application/json



Success Response

JSON


{
  "success": true,
  "message": "تمت العملية بنجاح",
  "data": {}
}



Error Response

JSON


{
  "success": false,
  "message": "الباسورد غلط أو رقم التليفون مكرر"
}



قواعد عامة

•
كل Endpoint محمي يحتاج Access Token صالحًا.

•
عند انتهاء Access Token يتم استخدام Refresh Token.

•
كل Response يجب أن يكون واضحًا وقابلًا للمعالجة من الواجهة.

•
الأخطاء يجب أن تعود برسالة مفهومة وكود HTTP مناسب.

•
العمليات الحساسة مثل الحضور Offline يجب أن تكون Idempotent باستخدام local_id.




10. Git Workflow

الفروع الرئيسية

•
main: نسخة Production.

•
staging: نسخة الاختبار.

•
Feature Branch: فرع منفصل لكل Feature.

طريقة العمل

Bash


git checkout staging
git pull origin staging
git checkout -b <name>/feature-<number>

# تنفيذ التعديلات

git add .
git commit -m "Implement feature"
git push origin <name>/feature-<number>



بعد ذلك:

1.
فتح Pull Request من Feature Branch إلى staging.

2.
كتابة ملخص للتغيير وطريقة الاختبار.

3.
انتظار Code Review.

4.
إصلاح الملاحظات إن وجدت.

5.
الدمج على staging بعد الموافقة.

6.
اختبار QA/UAT.

7.
فتح PR من staging إلى main بعد اعتماد النسخة.


لا يتم الدمج مباشرة إلى main أو staging بدون Pull Request ومراجعة.




11. خطة التنفيذ خلال أسبوعين

الأسبوع الأول — Foundation & Initial Implementation

الفريق

•
تثبيت main وstaging.

•
اعتماد Database Schema.

•
اعتماد API Contract.

•
تجهيز Layout وRTL والمكونات المشتركة.

•
تجهيز Mock Data عند الحاجة.

يوسف

•
Login وJWT وRefresh Token.

•
Owner/Receptionist Role Guards.

•
بداية Members CRUD.

•
Plans وSubscriptions والدفع Cash.

مريم

•
Quick Check-in.

•
شاشة الموجودين حاليًا.

•
last_attendance.

•
تصميم Offline Sync.

•
منطق التصنيفات وقوالب الرسائل.

مؤمن

•
Dashboard KPI Cards.

•
Segment Counters والشارتات.

•
Expenses CRUD والتصنيفات.

•
تعريف معادلة التقرير المالي.

محمد

•
Staff وRoles.

•
Shifts وStaff Attendance.

•
Products وStore Sales.

•
Equipment وMaintenance.

•
Admin Reminders.

الأسبوع الثاني — Integration, Testing & Release

الفريق

•
ربط الواجهات بالـ APIs الحقيقية.

•
استكمال المكونات الناقصة.

•
اختبار المسارات الكاملة.

•
إصلاح مشاكل التكامل.

•
QA/UAT.

•
تجهيز PR من staging إلى main.

يوسف

•
اختبار كامل للمصادقة والصلاحيات.

•
إكمال الأعضاء والاشتراكات والـ Soft Delete.

•
مراجعة عزل البيانات.

مريم

•
ربط الحضور بالأعضاء والاشتراكات.

•
إكمال Offline Sync ومنع التكرار.

•
اختبار كل فئات التصنيف وروابط WhatsApp.

مؤمن

•
ربط الداشبورد بالبيانات الحقيقية.

•
ربط المصروفات بالتقرير.

•
ربط اشتراكات Cash ومبيعات المتجر.

•
اختبار صافي الربح والفلاتر الزمنية.

محمد

•
ربط الموظفين والشيفتات.

•
إكمال البيع وخصم المخزون.

•
إكمال المعدات والتذكيرات.

•
اختبار حالات نفاد المخزون والصيانة المستحقة.




12. Definition of Done

لا تعتبر المهمة مكتملة إلا عند تحقق الآتي:

•
الـ Feature تعمل وفق الـ Acceptance Criteria.

•
الكود موجود على Feature Branch.

•
تم اتباع الـ API Contract والـ Schema.

•
تم دعم RTL عند الحاجة.

•
تم تنفيذ Validation.

•
تم التعامل مع Loading وSuccess وError وEmpty وDisabled.

•
تم اختبار السيناريو الأساسي والحالات الحدية.

•
لا توجد أخطاء واضحة في Console.

•
تم فتح Pull Request إلى staging.

•
تمت مراجعة الكود وإصلاح الملاحظات.

•
نجح QA/UAT.

•
تم تحديث مهمة ClickUp وإغلاقها بعد الاعتماد.




13. QA Checklist

Authentication




Login صحيح.




Login خاطئ.




Refresh Token.




Logout.




Owner permissions.




Receptionist permissions.




منع الوصول بدون Token.

Members & Subscriptions




إنشاء عضو.




تعديل عضو.




Soft Delete.




إنشاء باقة.




إنشاء اشتراك.




تجديد اشتراك.




الدفع Cash.




تاريخ انتهاء صحيح.

Attendance




حضور عضو باشتراك ساري.




رفض حضور عضو منتهي.




شاشة الموجودين اليوم.




Offline Sync.




منع التكرار باستخدام local_id.

Classification & Communication




عضو جديد.




اشتراك قريب الانتهاء.




عضو مختفي.




اشتراك منتهي.




قالب رسالة صحيح.




رابط WhatsApp صحيح.

Finance & Store




إضافة مصروف.




تصنيف المصروف.




إضافة منتج.




بيع منتج.




خصم المخزون.




منع البيع عند نفاد الكمية.




حساب صافي الربح.

Staff & Facilities




إضافة موظف.




إنشاء شيفت.




حضور وانصراف الموظف.




إضافة معدة.




حساب الصيانة القادمة.




إنشاء تذكير إداري.




14. ClickUp Structure

القائمة

Gym Management System - MVP

المهام الأساسية

•
00 - Project Setup & Git Workflow

•
00 - Database Schema

•
00 - API Contract

•
00 - Shared UI Setup

•
Member 1 - Core & Members

•
Member 2 - Operations & Engagement

•
Member 3 - Finance & Analytics

•
Member 4 - Staff, Store & Facilities

حالات المهام المقترحة

•
To Do

•
In Progress

•
Code Review

•
Changes Requested

•
QA / Testing

•
Done

•
Blocked

ربط المهام

•
Database Schema قبل كل الـ Features.

•
API Contract قبل ربط الواجهات.

•
Authentication قبل الأعضاء والحضور والمصروفات.

•
Members & Subscriptions قبل Attendance وClassification.

•
Store وExpenses قبل التقرير المالي النهائي.

•
جميع الـ Features قبل Integration وQA/UAT.




15. المخاطر والافتراضات

•
يتم استخدام Cash فقط في الـ MVP ولا يوجد Payment Gateway.

•
WhatsApp يتم من خلال Click-to-Chat وليس إرسالًا آليًا.

•
Offline Sync مخصص للحضور مع local_id لمنع التكرار.

•
QR Check-in اختياري حسب قرار الفريق.

•
أسماء أعضاء الفريق تستخدم للتوزيع في ClickUp بعد إضافتهم إلى Workspace.

•
الخطة ذات الأسبوعين مكثفة وتحتاج التزامًا يوميًا ودمجًا مبكرًا.

•
أي Feature تعتمد على Feature أخرى يجب أن تستخدم Mock Data مؤقتًا إذا كان ذلك لا يعطل التنفيذ.




16. النتيجة المتوقعة

بنهاية الأسبوعين يجب أن تكون نسخة MVP:

•
تحتوي على Features من 0 إلى 10.

•
تعمل بعزل كامل لبيانات كل جيم.

•
تدعم Owner وReceptionist.

•
تدير الأعضاء والاشتراكات والحضور والتواصل.

•
تعرض الداشبورد والتقارير المالية.

•
تدير الموظفين والمتجر والمعدات والتذكيرات.

•
تدعم RTL وحالات الواجهة الأساسية.

•
مرت بمراجعة كود واختبار QA/UAT.

•
جاهزة للدمج من staging إلى main بعد الاعتماد.

